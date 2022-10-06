const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const {
			success,
			paymentInfo: { id },
		} = ctx.params.body;

		// success = true
		// id = 1

		await this.broker.call("v1.PaymentInfoModel.findOneAndUpdate", [
			{
				id,
			},
			{
				status: success
					? paymentConstant.PAYMENT_STATUS.PAID
					: paymentConstant.PAYMENT_STATUS.FAILED,
			},
		]);

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
