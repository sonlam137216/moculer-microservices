const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { fromDate, toDate, method } = ctx.params.body;

		const inputFromDate = moment(fromDate).startOf("day").toISOString();
		const inputToDate = moment(toDate).endOf("day").toISOString();

		const paymentDetails = await this.broker.call(
			"v1.PaymentInfoModel.aggregate",
			[
				[
					{
						$match: {
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
								status: "$status",
							},
							totalCount: { $sum: 1 },
						},
					},
					{
						$group: {
							_id: "$_id.createdAt",
							payments: {
								$push: {
									status: "$_id.status",
									count: "$totalCount",
								},
							},
							totalCountInOneDay: { $sum: "$totalCount" },
						},
					},
					{
						$sort: {
							createdAt: -1,
							totalCountInOneDay: 1,
							count: 1,
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
				paymentDetails,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
