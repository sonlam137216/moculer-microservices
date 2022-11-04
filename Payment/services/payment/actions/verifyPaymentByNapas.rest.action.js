const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
const paymentI18nConstant = require("../constants/paymentI18n.constant");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const {
			response: { responseStatus, transaction },
			paymentId,
		} = ctx.params.body;

		const updatedPayment = await this.broker.call(
			"v1.PaymentInfoModel.findOneAndUpdate",
			[
				{
					id: paymentId,
					status: paymentConstant.PAYMENT_STATUS.UNPAID,
				},
				{
					status: responseStatus
						? paymentConstant.PAYMENT_STATUS.PAID
						: paymentConstant.PAYMENT_STATUS.FAILED,
					supplierResponse: {
						responseStatus,
						transaction,
					},
					supplierTransaction: transaction,
				},
				{ new: true },
			]
		);

		if (!updatedPayment) {
			return {
				code: 1001,
				message: this.__(paymentI18nConstant.ERROR_PAYMENT_EXPIRED),
			};
		}

		await ctx.broadcast("graphql.publish", {
			tag: "Payment",
			payload: {
				type: "VERIFY_PAYMENT",
				message: "Verify payment",
			},
		});

		return {
			code: 1000,
			message: this.__(paymentI18nConstant.PAYMENT_UPDATE_SUCCESS),
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
