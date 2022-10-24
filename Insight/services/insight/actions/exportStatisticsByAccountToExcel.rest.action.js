const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const excelJs = require("exceljs");
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { fromDate, toDate } = ctx.params.body;

		const inputFromDate = moment(fromDate).startOf("day").toISOString();
		const inputToDate = moment(toDate).endOf("day").toISOString();

		// excelJS

		const options = {
			filename: `./files/statistics_by_accountId_${fromDate}-${toDate}.xlsx`,
			useStyles: true,
			useSharedStrings: true,
		};

		const path = "./files"; // Path to download excel
		const workbook = new excelJs.stream.xlsx.WorkbookWriter(options);
		const worksheet = workbook.addWorksheet("my sheet");

		// column for data in excel. key must match data key
		worksheet.columns = [
			{ header: "S no.", key: "s_no", width: 10 },
			{ header: "Username", key: "fullName", width: 30 },
			{
				header: "UserId",
				key: "id",
				width: 10,
			},
			{
				header: "Email",
				key: "email",
				width: 30,
			},
			{
				header: "Total Count",
				key: "totalCount",
				width: 15,
			},
			{
				header: "Total Count Of Success",
				key: "totalCountOfSuccess",
				width: 15,
			},
		];

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
					// {
					// 	$limit: 100,
					// },
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
		const length = paymentGroupByAccount.length;
		for (let i = 0; i < length; i++) {
			accountIds.push(paymentGroupByAccount[i].id);
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
					message: "User account error",
				},
			};
		}

		let accountsAndPayments = _.merge(userAccounts, paymentGroupByAccount);

		// add data to excel
		let accountsAndPaymentsLength = accountsAndPayments.length;

		for (let i = 0; i < accountsAndPaymentsLength; i++) {
			const paymentGroup = {
				s_no: i + 1,
				fullName: accountsAndPayments[i].fullName,
				id: accountsAndPayments[i].id,
				email: accountsAndPayments[i].email,
				totalCount: accountsAndPayments[i].totalCount,
				totalCountOfSuccess: accountsAndPayments[i].totalCountOfSuccess,
			};

			worksheet.addRow(paymentGroup).commit(); // add data to work sheet
		}
		workbook.commit().then(function () {
			console.log("excel file created");
		});

		return {
			code: 1000,
			data: {
				message: "Export file success",
				paths: `${path}/statistics_by_accountId_${fromDate}-${toDate}.xlsx`,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
