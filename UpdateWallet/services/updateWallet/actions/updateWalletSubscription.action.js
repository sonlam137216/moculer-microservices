const _ = require("lodash");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { type } = ctx.params.payload;
		let data;

		if (!type) {
			return {
				payload: {
					type,
					message: "lỗi",
				},
			};
		}

		switch (type) {
			case updateWalletConstant.UPDATE_WALLET_SUBSCRIPTION_TYPE.DEPOSIT:
				data = await this.broker.call(
					"v1.UpdateWalletGraph.depositUpdateWalletSubscription",
					{
						payload: ctx.params.payload,
					}
				);
				break;

			case updateWalletConstant.UPDATE_WALLET_SUBSCRIPTION_TYPE.WITHDRAW:
				data = await this.broker.call(
					"v1.UpdateWalletGraph.withdrawUpdateWalletSubscription",
					{
						payload: ctx.params.payload,
					}
				);
				break;

			case updateWalletConstant.UPDATE_WALLET_SUBSCRIPTION_TYPE.TRANSFER:
				data = await this.broker.call(
					"v1.UpdateWalletGraph.transferUpdateWalletSubscription",
					{
						payload: ctx.params.payload,
					}
				);
				break;
			default:
				break;
		}

		return data;
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
