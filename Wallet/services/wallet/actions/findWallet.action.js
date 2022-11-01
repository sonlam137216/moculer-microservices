const _ = require("lodash");
const walletI18nConstant = require("../constants/walletI18n.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.params;
		const existingWallet = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: userId }]
		);

		if (_.get(existingWallet, "id", null) === null) {
			throw new MoleculerError(
				this.__(walletI18nConstant.ERROR_WALLET_NOT_FOUND),
				404
			);
		}

		return true;
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
