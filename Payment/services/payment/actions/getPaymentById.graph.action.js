const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const paymentI18nConstant = require("../constants/paymentI18n.constant");

module.exports = async function (ctx) {
	try {
		const { userId, expiredAt } = ctx.meta.auth.credentials;

		const { id } = ctx.params.input;

		// check UserID
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				succeeded: false,
				message: this.__(paymentI18nConstant.USER_NOT_EXIST),
			};
		}

		const paymentExisting = await this.broker.call(
			"v1.PaymentInfoModel.findOne",
			[{ id, userId }]
		);

		if (!paymentExisting) {
			return {
				succeeded: false,
				message: this.__(paymentI18nConstant.ERROR_PAYMENT_NOT_FOUND),
			};
		}

		const paymentInfo = _.pick(paymentExisting, [
			"supplierResponse",
			"supplierTransaction",
			"totalPrice",
			"description",
			"note",
			"paymentMethod",
			"status",
			"id",
		]);

		const userInfo = _.pick(existingUser, [
			"id",
			"fullName",
			"email",
			"phone",
			"gender",
		]);

		return {
			succeeded: true,
			message: this.__(paymentI18nConstant.PAYMENT_GET_SUCCESS),
			paymentInfo: { ...paymentInfo, userInfo },
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
