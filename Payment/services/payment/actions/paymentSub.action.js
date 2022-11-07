const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { type, message } = ctx.params.payload;
		let data;

		console.log("payment Sub", ctx);

		switch (type) {
			case paymentConstant.PAYMENT_SUBSCRIPTION_TYPE.CREATE_PAYMENT:
				data = await this.broker.call(
					"v1.PaymentGraph.createPaymentSubscription",
					{
						payload: ctx.params.payload,
					}
				);
				break;

			case paymentConstant.PAYMENT_SUBSCRIPTION_TYPE.CANCEL_PAYMENT:
				data = await this.broker.call(
					"v1.PaymentGraph.cancelPaymentSubscription",
					{
						payload: ctx.params.payload,
					}
				);
				break;

			case paymentConstant.PAYMENT_SUBSCRIPTION_TYPE.VERIFY_PAYMENT:
				data = await this.broker.call(
					"v1.PaymentGraph.verifyByNapasPaymentSubscription",
					{
						payload: ctx.params.payload,
					}
				);
				break;
			default:
				break;
		}

		return data;
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
