const _ = require("lodash");
const md5 = require("md5");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		// receive OTP
		const { otp, transactionId, receiverId } = ctx.params.body;
		const { userId } = ctx.meta.auth.credentials;

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
					message: "Không tìm thấy user!",
				},
			};
		}

		const existingReceiverUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[
				{
					id: receiverId,
				},
			]
		);

		if (_.get(existingReceiverUser, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy thông tin người nhận!",
				},
			};
		}

		// check transaction
		const existingTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOne",
			[
				{
					walletIdOfSender: userId,
					walletIdOfReceiver: receiverId,
					"transactionInfo.transactionId": transactionId,
				},
			]
		);

		if (_.get(existingTransaction, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy transaction",
				},
			};
		}

		// verify OTP
		const existingOtp = await this.broker.call("v1.OTPModel.findOne", [
			{
				userId,
				transactionId,
				status: updateWalletConstant.OTP_STATUS.ACTIVE,
			},
		]);

		if (_.get(existingOtp, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "OTP đã hết hạn!",
				},
			};
		}

		if (md5(otp) !== existingOtp.otp) {
			return {
				code: 1001,
				data: {
					message: "OTP không trùng khớp!",
				},
			};
		}

		// success
		const updatedWallet = await this.broker.call(
			"v1.Wallet.updateWallet.async",
			{
				params: {
					transactionInfo: existingTransaction,
					receiverId: receiverId,
					senderId: userId,
					serviceName: ctx.service.name,
				},
			}
		);

		// queue always return return true!!!! need to notify to admin

		const updatedTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOneAndUpdate",
			[
				{
					walletIdOfSender: userId,
					walletIdOfReceiver: receiverId,
					"transactionInfo.transactionId": transactionId,
				},
				{
					$set: {
						"transactionInfo.status":
							updateWalletConstant.TRANSACTION_STATUS.SUCCEEDED,
					},
				},
				{
					new: true,
				},
			]
		);

		console.log("updatedTransaction", updatedTransaction);

		if (_.get(updatedTransaction, "id", null) === null) {
			await this.broker.call(
				"v1.UpdateWalletInfoModel.findOneAndUpdate",
				[
					{
						walletIdOfSender: userId,
						walletIdOfReceiver: receiverId,
						"transactionInfo.transactionId": transactionId,
					},
					{
						$set: {
							"transactionInfo.status":
								updateWalletConstant.TRANSACTION_STATUS.FAILED,
						},
					},
					{
						new: true,
					},
				]
			);
			return {
				code: 1001,
				data: {
					message: "Cập nhật transaction không thành công!",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Thành công!",
				transactionInfo: updatedTransaction,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
