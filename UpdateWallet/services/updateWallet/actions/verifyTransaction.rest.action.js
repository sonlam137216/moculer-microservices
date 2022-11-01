const _ = require("lodash");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;
const axios = require("axios");
const updateWalletI18nConstant = require("../constant/updateWalletI18n.constant");

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;
		const { otp, transactionId } = ctx.params.body;

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

		const existingTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOne",
			[
				{
					"transactionInfo.status":
						updateWalletConstant.TRANSACTION_STATUS.PENDING,
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
				data: {},
			};
		}

		const verifyTransactionFromBank = await this.broker.call(
			"v1.Bank.verifyRequestPayment",
			{
				otp,
				transactionId:
					existingTransaction.transactionInfoFromSupplier
						.transactionId,
			}
		);

		if (!verifyTransactionFromBank) {
			return {
				code: 1001,
				message: this.__(
					updateWalletI18nConstant.ERROR_RESPONSE_FROM_BANK
				),
				data: {},
			};
		}

		const { success } = verifyTransactionFromBank;

		if (success === true) {
			const updatedTransaction = await this.broker.call(
				"v1.UpdateWalletInfoModel.findOneAndUpdate",
				[
					{
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
					message: this.__(
						updateWalletI18nConstant.ERROR_TRANSACTION_UPDATE
					),
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
				message: this.__(
					updateWalletI18nConstant.TRANSACTION_CONFIRM_SUCCESS
				),
			};
		}

		return {
			code: 1001,
			message: this.__(
				updateWalletI18nConstant.TRANSACTION_VERIFY_FAILED
			),
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
