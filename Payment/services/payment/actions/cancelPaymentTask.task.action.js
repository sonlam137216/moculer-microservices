const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		let currentTime = new Date(Date.now());
		let timeBeforeOneHour = new Date(
			currentTime.setHours(currentTime.getHours() - 1)
		).toISOString();

		const updatedPayments = await this.broker.call(
			"v1.PaymentInfoModel.updateMany",
			[
				{
					createdAt: { $lt: timeBeforeOneHour },
					status: paymentConstant.PAYMENT_STATUS.UNPAID,
				},
				{
					status: paymentConstant.PAYMENT_STATUS.EXPIRED,
				},
			]
		);

		console.log("updatedPayments", updatedPayments);
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
