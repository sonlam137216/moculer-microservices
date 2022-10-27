const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { fromDate, toDate, method } = ctx.params.body;

		const inputFromDate = moment(fromDate).startOf("day").toISOString();
		const inputToDate = moment(toDate).endOf("day").toISOString();

		const dateCompareQuery = {
			$expr: {
				$and: [
					{
						$gte: [
							"$createdAt",
							{
								$dateFromString: {
									dateString: inputFromDate,
								},
							},
						],
					},
					{
						$lte: [
							"$createdAt",
							{
								$dateFromString: {
									dateString: inputToDate,
								},
							},
						],
					},
				],
			},
		};

		const methodQuery = method ? { paymentMethod: method } : {};

		const paymentDetails = await this.broker.call(
			"v1.PaymentInfoModel.aggregate",
			[
				[
					{
						$match: {
							...dateCompareQuery,
							...methodQuery,
						},
					},
					{
						$group: {
							_id: {
								createdAt: {
									$dateToString: {
										format: "%Y-%m-%d",
										date: "$createdAt",
									},
								},
							},
							totalCount: { $sum: 1 },
							totalCountOfSuccess: {
								$sum: {
									$cond: {
										if: { $eq: ["$status", "PAID"] },
										then: 1,
										else: 0,
									},
								},
							},
						},
					},
					{
						$project: {
							date: "$_id.createdAt",
							_id: 0,
							totalCount: 1,
							totalCountOfSuccess: 1,
						},
					},
					{
						$sort: {
							createdAt: -1,
							totalCountInOneDay: 1,
						},
					},
				],
			]
		);

		if (!paymentDetails) {
			return {
				code: 1001,
				data: {
					message: "Tạo thống kê không thành công!",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "thanh cong",
				payments: paymentDetails,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
