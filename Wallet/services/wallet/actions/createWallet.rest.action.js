const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { paymentMethods } = ctx.params.body;
		const { userId } = ctx.meta.auth.credentials;

		// check userId
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				data: {
					message: "User không tồn tại",
				},
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
				data: {
					message: "User đã có ví",
				},
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
			data: {
				message: "Tạo Wallet thành công",
				walletInfo: walletCreate,
			},
		};
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
