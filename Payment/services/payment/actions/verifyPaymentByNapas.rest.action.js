const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const {
			success,
			paymentInfo: { id },
		} = ctx.params.body;

		const updatedPayment = await this.broker.call(
			"v1.PaymentInfoModel.findOneAndUpdate",
			[
				{
					id,
					status: paymentConstant.PAYMENT_STATUS.UNPAID,
				},
				{
					status: success
						? paymentConstant.PAYMENT_STATUS.PAID
						: paymentConstant.PAYMENT_STATUS.FAILED,
				},
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
