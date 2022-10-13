const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { userId, expiredAt } = ctx.meta.auth.credentials;

		const {
			params: { id },
		} = ctx.params;

		this.setLocale("vi");
		console.log("I18N", this.__("error"));

		// check UserID
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				data: {
					message: "User không tồn tại!",
				},
			};
		}

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
