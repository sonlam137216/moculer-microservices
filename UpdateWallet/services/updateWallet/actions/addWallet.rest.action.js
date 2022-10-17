const { default: axios } = require("axios");
const _ = require("lodash");
const generateTransactionId = require("../../../utils/generateTransactionId");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;

		// lock = await this.broker.cacher.lock(`accountId_${userId}`, 60 * 1000);

		const { transactionAmount } = ctx.params.body;

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

		// check existing wallet
		const existingWallet = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: userId }]
		);

		if (!existingWallet) {
			return {
				code: 1001,
				data: {
					message: "User chưa tạo ví",
				},
			};
		}

		// create local transaction
		const randomTransactionId = generateTransactionId();
		const transactionCreateObj = {
			walletIdOfSender: existingWallet.id,
			walletIdOfReceiver: existingWallet.id,
			transactionInfo: {
				transactionId: randomTransactionId,
				transactionAmount,
				status: updateWalletConstant.TRANSACTION_STATUS.PENDING,
				transferType: updateWalletConstant.WALLET_ACTION_TYPE.ADD,
			},
		};
		const transactionCreate = await this.broker.call(
			"v1.UpdateWalletInfoModel.create",
			[transactionCreateObj]
		);

		console.log("transactionCreate", transactionCreate);

		if (_.get(transactionCreate, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Tạo transaction không thành công!",
				},
			};
		}

		const userInfo = _.pick(existingUser, ["id", "email", "phone"]);
		const walletInfo = _.pick(transactionCreate, [
			"id",
			"transferType",
			"transactionAmount",
		]);

		const transactionResponseFromBank = await axios.post(
			"http://localhost:3000/v1/External/Bank/CreateRequestPayment",
			{ phone: userInfo.phone, transactionAmount }
		);

		console.log(
			"transactionResponseFromBank",
			transactionResponseFromBank.data.data
		);

		if (!transactionResponseFromBank) {
			return {
				code: 1001,
				data: {
					message: "Tạo giao dịch với ngân hàng không thành công!",
				},
			};
		}

		// update transaction
		const updatedTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOneAndUpdate",
			[
				{
					walletIdOfSender: existingUser.id,
					walletIdOfReceiver: existingUser.id,
					"transactionInfo.status":
						updateWalletConstant.TRANSACTION_STATUS.PENDING,
					"transactionInfo.transactionId": randomTransactionId,
				},
				{
					transactionInfoFromSupplier: {
						transactionId:
							transactionResponseFromBank.data.data
								.transactionInfo.transactionId,
						transactionAmount:
							transactionResponseFromBank.data.data
								.transactionInfo.transactionAmount,
						status: transactionResponseFromBank.data.data
							.transactionInfo.status,
					},
				},
			]
		);

		console.log("updatedTransaction", updatedTransaction);

		if (_.get(updatedTransaction, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Cập nhật giao dịch không thành công!",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Gửi thông tin qua ngân hàng!",
				userInfo,
				walletInfo,
				transactionInfo: updatedTransaction,
				responseFromBank: transactionResponseFromBank.data.data,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
