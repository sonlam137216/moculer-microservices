const _ = require("lodash");
const excelJs = require("exceljs");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const insightConstant = require("../constant/insight.constant");

module.exports = async function (ctx) {
	try {
		const { fromDate, toDate, method } = ctx.params.body;

		// excelJS
		const path = "./files"; // Path to download excel
		const workbook = new excelJs.Workbook(); // create new workbook
		const worksheet = workbook.addWorksheet("Statistics"); // new worksheet

		// column for data in excel. key must match data key
		worksheet.columns = [
			{ header: "S no.", key: "s_no", width: 10 },
			{ header: "DAY", key: "date", width: 10 },
			{
				header: "Total In Day",
				key: "totalInDay",
				width: 30,
			},
			{
				header: "Total Success In Day",
				key: "totalSuccessInDay",
				width: 30,
			},
		];

		const {
			data: { payments },
		} = await this.broker.call("v1.Insight.transactionStatisticsByDay", {
			body: { fromDate, toDate, method },
		});

		if (!payments) {
			return {
				code: 1001,
				message: this.__(insightConstant.ERROR_INSIGHT_CREATE),
			};
		}

		// add data to excel
		payments.forEach((payment, index) => {
			const paymentGroup = {
				s_no: index + 1,
				date: payment.date,
				totalInDay: payment.totalCount,
				totalSuccessInDay: payment.totalCountOfSuccess,
			};
			worksheet.addRow(paymentGroup); // add data to work sheet
		});

		// Making first line to bold format
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		const data = await workbook.xlsx.writeFile(
			`${path}/statistics_${fromDate}-${toDate}.xlsx`
		);

		return {
			code: 1000,
			message: this.__(insightConstant.INSIGHT_CREATE_SUCCESS),
			data: {
				path: `${path}/statistics_${fromDate}-${toDate}.xlsx`,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
