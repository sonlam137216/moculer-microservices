const _ = require("lodash");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;
const axios = require("axios");

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;
		const { otp, transactionId } = ctx.params.body;

		console.log(ctx.service.name);

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
					message: "User không tồn tại!",
				},
			};
		}

		const existingTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOne",
			[
				{
					walletIdOfSender: existingUser.id,
					walletIdOfReceiver: existingUser.id,
					"transactionInfo.status":
						updateWalletConstant.TRANSACTION_STATUS.PENDING,
					"transactionInfo.transactionId": transactionId,
				},
			]
		);

		if (_.get(existingTransaction, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy thông tin transaction!",
				},
			};
		}

		const verifyTransactionFromBank = await axios.post(
			"http://localhost:3000/v1/External/Bank/VerifyRequestPayment",
			{
				otp,
				transactionId:
					existingTransaction.transactionInfoFromSupplier
						.transactionId,
			}
		);

		console.log(
			"verifyTransactionFromBank",
			verifyTransactionFromBank.data
		);

		if (!verifyTransactionFromBank) {
			return {
				code: 1001,
				data: {
					message: "Không thể lấy thông tin từ ngân hàng!",
				},
			};
		}

		const { success } = verifyTransactionFromBank.data;

		// verifyTransactionFromBank.data.data.transactionInfo;
		console.log("SUCCESS", success);

		if (success === true) {
			const updatedTransaction = await this.broker.call(
				"v1.UpdateWalletInfoModel.findOneAndUpdate",
				[
					{
						walletIdOfSender: existingUser.id,
						walletIdOfReceiver: existingUser.id,
						"transactionInfo.status":
							updateWalletConstant.TRANSACTION_STATUS.PENDING,
						"transactionInfo.transactionId": transactionId,
					},
					{
						$set: {
							"transactionInfo.status":
								updateWalletConstant.TRANSACTION_STATUS
									.SUCCEEDED,
						},
					},
				]
			);

			if (_.get(updatedTransaction, "id", null) === null) {
				return {
					code: 1001,
					data: {
						message:
							"Cập nhật transaction không thành công [server]",
					},
				};
			}

			await this.broker.call("v1.Wallet.updateWallet.async", {
				params: {
					transactionInfo: updatedTransaction,
					receiverId: userId,
					senderId: userId,
					serviceName: ctx.service.name,
				},
			});

			return {
				code: 1000,
				data: {
					message: "Giao dịch thành công!",
				},
			};
		}

		return {
			code: 1001,
			data: {
				message: "Giao dịch không thành công!",
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
