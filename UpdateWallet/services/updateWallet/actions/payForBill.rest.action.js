const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const generateTransactionId = require("../../../utils/generateTransactionId");
const updateWalletConstant = require("../constant/updateWallet.constant");

module.exports = async function (ctx) {
	try {
		const { transactionAmount, userId } = ctx.params;

		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[
				{
					id: userId,
				},
			]
		);

		if (_.get(existingUser, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy user",
				},
			};
		}

		const existingWallet = await this.broker.call("v1.Wallet.findWallet", {
			userId,
		});

		if (!existingWallet) {
			throw new MoleculerError("không tìm thấy ví", 404);
		}

		if (existingWallet.balanceAvailable - transactionAmount < 0) {
			throw new MoleculerError("Số dư không đủ!", 400);
		}

		const randomTransactionId = generateTransactionId();
		const transactionCreateObj = {
			transactionInfo: {
				transactionId: randomTransactionId,
				transactionAmount,
				status: updateWalletConstant.TRANSACTION_STATUS.PENDING,
				transferType: updateWalletConstant.WALLET_ACTION_TYPE.SUB,
			},
		};
		const transactionCreate = await this.broker.call(
			"v1.UpdateWalletInfoModel.create",
			[transactionCreateObj]
		);

		if (_.get(transactionCreate, "id", null) === null) {
			throw new MoleculerError("Tạo transaction không thành công!");
		}

		const updatedWallet = await this.broker.call(
			"v1.Wallet.updateWallet.async",
			{
				params: {
					transactionInfo: transactionCreate,
					receiverId: userId,
					senderId: userId,
					serviceName: ctx.service.name,
				},
			}
		);

		const updatedTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOneAndUpdate",
			[
				{
					"transactionInfo.status":
						updateWalletConstant.TRANSACTION_STATUS.PENDING,
					"transactionInfo.transactionId": randomTransactionId,
				},
				{
					$set: {
						"transactionInfo.status":
							updateWalletConstant.TRANSACTION_STATUS.SUCCEEDED,
					},
				},
			]
		);

		if (_.get(updatedTransaction, "id", null) === null) {
			throw new MoleculerError("Cập nhật transaction không thành công!");
		}

		return true;
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
