const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const excelJs = require("exceljs");
const moment = require("moment");
const insightConstant = require("../constant/insight.constant");

module.exports = async function (ctx) {
	try {
		const { fromDate, toDate, accountId } = ctx.params.body;

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

		const {
			data: { accountsAndPayments },
		} = await this.broker.call(
			"v1.Insight.transactionStatisticsByAccount",
			{ body: { fromDate, toDate, accountId } }
		);

		// add data to excel
		let accountsAndPaymentsLength = accountsAndPayments.length;

		for (let i = 0; i < accountsAndPaymentsLength; i++) {
			const paymentGroup = {
				s_no: i + 1,
				fullName: accountsAndPayments[i].fullName,
				id: accountsAndPayments[i].id,
				email: accountsAndPayments[i].email,
				totalCount: accountsAndPayments[i].totalTransaction,
				totalCountOfSuccess:
					accountsAndPayments[i].totalTransactionSuccess,
			};

			worksheet.addRow(paymentGroup).commit(); // add data to work sheet
		}
		workbook.commit().then(function () {
			console.log("excel file created");
		});

		return {
			code: 1000,
			message: this.__(insightConstant.INSIGHT_CREATE_SUCCESS),
			data: {
				path: `${path}/statistics_by_accountId_${fromDate}-${toDate}.xlsx`,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
