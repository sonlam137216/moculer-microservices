const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { fromDate, toDate, method } = ctx.params.body;

		const inputFromDate = moment(fromDate).startOf("day").toISOString();
		const inputToDate = moment(toDate).endOf("day").toISOString();

		const paymentGroupByAccount = await this.broker.call(
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
							paymentMethod: method
								? { $eq: method }
								: { $exists: true },
						},
					},
					{
						$group: {
							_id: "$userId",
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
							id: "$_id",
							_id: 0,
							totalCount: 1,
							totalCountOfSuccess: 1,
						},
					},
					{
						$sort: {
							totalCount: -1,
							totalCountOfSuccess: -1,
						},
					},
				],
			],
			{ timeout: 90000 }
		);

		if (!paymentGroupByAccount) {
			return {
				code: 1001,
				data: {
					message: "Group By Account không thành công!",
				},
			};
		}

		const accountIds = [];
		let totalTransaction = 0;
		let totalTransactionSuccess = 0;
		const length = paymentGroupByAccount.length;
		for (let i = 0; i < length; i++) {
			accountIds.push(paymentGroupByAccount[i].id);
			totalTransaction += paymentGroupByAccount[i].totalCount;
			totalTransactionSuccess +=
				paymentGroupByAccount[i].totalCountOfSuccess;
		}

		const userAccounts = await this.broker.call(
			"v1.UserInfoModel.findMany",
			[
				{
					id: { $in: accountIds },
				},
				"fullName id email -_id",
				{
					sort: { fullName: 1, id: 1, email: 1 },
				},
			],
			{ timeout: 90000 }
		);

		if (!userAccounts) {
			return {
				code: 1001,
				data: {
					message: "Group By Account không thành công!",
				},
			};
		}

		const accountsAndPayment = _.merge(userAccounts, paymentGroupByAccount);

		return {
			code: 1000,
			data: {
				message: "Thành công",
				totalTransaction,
				totalTransactionSuccess,
				accountsAndPayment,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
