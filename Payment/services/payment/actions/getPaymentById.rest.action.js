const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const paymentI18nConstant = require("../constants/paymentI18n.constant");

module.exports = async function (ctx) {
	try {
		const { userId, expiredAt } = ctx.meta.auth.credentials;

		const {
			params: { id },
		} = ctx.params;

		// check UserID
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				message: this.__(paymentI18nConstant.USER_NOT_EXIST),
			};
		}

		const paymentInfo = await this.broker.call(
			"v1.PaymentInfoModel.findOne",
			[{ id, userId }]
		);

		if (!paymentInfo) {
			return {
				code: 1001,
				message: this.__(paymentI18nConstant.ERROR_PAYMENT_NOT_FOUND),
			};
		}

		return {
			code: 1000,
			message: this.__(paymentI18nConstant.PAYMENT_GET_SUCCESS),
			data: {
				paymentInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
