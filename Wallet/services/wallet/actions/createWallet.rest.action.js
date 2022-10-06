const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { balanceAvailable, ownerId, paymentMethods } = ctx.params.body;

		// check ownerID
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: ownerId }]
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
			[{ ownerId }]
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
					balanceAvailable,
					ownerId,
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
