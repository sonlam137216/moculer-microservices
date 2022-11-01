const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const walletI18nConstant = require("../constants/walletI18n.constant");

module.exports = async function (ctx) {
	try {
		const { paymentMethods, language } = ctx.params.body;
		const { userId } = ctx.meta.auth.credentials;

		if (language && language === "en") this.setLocale(language);

		// check userId
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
		const existingWallet = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ userId }]
		);

		if (existingWallet) {
			return {
				code: 1001,
				message: this.__(walletI18nConstant.ERROR_USER_WALLET_EXISTED),
				data: {},
			};
		}

		const walletCreate = await this.broker.call(
			"v1.WalletInfoModel.create",
			[
				{
					ownerId: userId,
					paymentMethods,
				},
			]
		);

		return {
			code: 1000,
			message: this.__(walletI18nConstant.WALLET_CREATE_SUCCESS),
			data: {
				walletInfo: walletCreate,
			},
		};
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
