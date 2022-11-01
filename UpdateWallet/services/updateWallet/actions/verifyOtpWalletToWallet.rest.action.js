const _ = require("lodash");
const md5 = require("md5");
const updateWalletConstant = require("../constant/updateWallet.constant");
const updateWalletI18nConstant = require("../constant/updateWalletI18n.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		// receive OTP
		const { otp, transactionId, receiverId } = ctx.params.body;
		const { userId } = ctx.meta.auth.credentials;

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
				message: this.__(updateWalletI18nConstant.USER_NOT_EXIST),
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
				message: this.__(updateWalletI18nConstant.RECEIVER_NOT_EXIST),
			};
		}

		// check transaction
		const existingTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOne",
			[
				{
					"transactionInfo.transactionId": transactionId,
				},
			]
		);

		if (_.get(existingTransaction, "id", null) === null) {
			return {
				code: 1001,
				message: this.__(
					updateWalletI18nConstant.ERROR_TRANSACTION_NOT_FOUND
				),
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
				message: this.__(updateWalletI18nConstant.ERROR_OTP_EXPIRED),
				data: {},
			};
		}

		if (md5(otp) !== existingOtp.otp) {
			return {
				code: 1001,
				message: this.__(updateWalletI18nConstant.ERROR_OTP_NOT_MATCH),
				data: {},
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
				message: this.__(
					updateWalletI18nConstant.TRANSACTION_VERIFY_FAILED
				),
				data: {},
			};
		}

		return {
			code: 1000,
			message: this.__(
				updateWalletI18nConstant.TRANSACTION_VERIFY_SUCCESS
			),
			data: {
				transactionInfo: updatedTransaction,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
