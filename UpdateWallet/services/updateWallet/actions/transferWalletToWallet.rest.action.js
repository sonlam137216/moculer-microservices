const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;
		const { receiverId } = ctx.params.body;

		const existingSenderUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);
		if (_.get(existingSenderUser, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy người gửi",
				},
			};
		}

		const existingReceiverUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: receiverId }]
		);
		if (_.get(existingReceiverUser, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy người nhận",
				},
			};
		}

		const existingSenderWallet = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: userId }]
		);
		if (_.get(existingSenderWallet, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy wallet người gửi",
				},
			};
		}

		const existingReceiverWallet = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: receiverId }]
		);
		if (_.get(existingReceiverWallet, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy wallet người nhận",
				},
			};
		}

		// create transaction
		const transactionCreate = await this.broker.call(
			"v1.UpdateWalletInfoModel.create"
		);
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
