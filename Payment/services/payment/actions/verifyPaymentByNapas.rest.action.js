const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
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
		console.log("updatedPayment", updatedPayment);

		if (!updatedPayment) {
			return {
				code: 1001,
				data: {
					message:
						"Payment hết hạn hoặc cập nhật không thành công, vui lòng liên hệ trực tiếp!",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Cập nhật thành công",
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
