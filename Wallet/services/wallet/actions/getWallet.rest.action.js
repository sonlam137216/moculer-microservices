const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const walletI18nConstant = require("../constants/walletI18n.constant");

module.exports = async function (ctx) {
	try {
		const { userId, expiredAt } = ctx.meta.auth.credentials;

		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				message: this.__(walletI18nConstant.USER_NOT_EXIST),
			};
		}

		// check exiting wallet
		const walletInfo = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: userId }]
		);

		if (!walletInfo) {
			return {
				code: 1001,
				message: this.__(walletI18nConstant.ERROR_WALLET_NOT_FOUND),
			};
		}

		return {
			code: 1000,
			message: this.__(walletI18nConstant.GET_INFO_SUCCESS),
			data: {
				walletInfo,
			},
		};
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
