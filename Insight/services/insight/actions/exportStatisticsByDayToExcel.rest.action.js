const _ = require("lodash");
const excelJs = require("exceljs");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { fromDate, toDate, method } = ctx.params.body;

		const inputFromDate = moment(fromDate).startOf("day").toISOString();
		const inputToDate = moment(toDate).endOf("day").toISOString();

		// excelJS
		const path = "./files"; // Path to download excel
		const workbook = new excelJs.Workbook(); // create new workbook
		const worksheet = workbook.addWorksheet("Statistics"); // new worksheet

		// column for data in excel. key must match data key
		worksheet.columns = [
			{ header: "S no.", key: "s_no", width: 10 },
			{ header: "DAY", key: "_id", width: 10 },
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

		const payments = await this.broker.call(
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

		if (!payments) {
			return {
				code: 1001,
				data: {
					message: "Tạo thống kê không thành công!",
				},
			};
		}

		// add data to excel
		payments.forEach((payment, index) => {
			const paymentGroup = {
				s_no: index + 1,
				_id: payment._id,
				totalInDay: payment.totalCountInOneDay,
				totalSuccessInDay: payment.payments[3].count,
			};
			console.log("paymentGroup", paymentGroup);
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
			data: {
				message: "Export file success",
				paths: `${path}/statistics_${fromDate}-${toDate}.xlsx`,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};