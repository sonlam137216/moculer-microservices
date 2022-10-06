const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const userId = ctx.meta.auth.credentials.userId;

		const {
			params: { id },
		} = ctx.params;

		const paymentInfo = await this.broker.call(
			"v1.PaymentInfoModel.findOne",
			[{ id, userId }]
		);

		if (!paymentInfo) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy thông tin thanh toán!",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Lấy thông tin thanh toán thành công!",
				paymentInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
