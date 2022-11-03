const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const insightConstant = require("../constant/insight.constant");

module.exports = async function (ctx) {
	try {
		const { fromDate, toDate, accountId } = ctx.params.input;

		const data = await this.broker.call(
			"v1.Insight.transactionStatisticsByDay", {body: { fromDate, toDate, accountId }}
		);

		console.log("DATA", data);

		return {
			succeeded: true,
			message: this.__(insightConstant.INSIGHT_CREATE_SUCCESS),
			// data: {
			// 	totalTransaction,
			// 	totalTransactionSuccess,
			// 	accountsAndPayments: accountsAndPaymentSorted,
			// },
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
