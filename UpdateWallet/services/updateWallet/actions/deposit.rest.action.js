const { default: axios } = require("axios");
const _ = require("lodash");
const generateTransactionId = require("../../../utils/generateTransactionId");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;
const updateWalletI18nConstant = require("../constant/updateWalletI18n.constant");

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;

		const { transactionAmount } = ctx.params.body;

		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				message: this.__(updateWalletI18nConstant.USER_NOT_EXIST),
			};
		}

		// check existing wallet
		const existingWallet = await this.broker.call("v1.Wallet.findWallet", {
			userId,
		});

		if (!existingWallet) {
			return {
				code: 1001,
				message: this.__(updateWalletI18nConstant.ERROR_USER_WALLET),
			};
		}

		// create local transaction
		const randomTransactionId = generateTransactionId();
		const transactionCreateObj = {
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
				message: this.__(
					updateWalletI18nConstant.ERROR_TRANSACTION_CREATE
				),
			};
		}

		const userInfo = _.pick(existingUser, ["id", "email", "phone"]);
		const walletInfo = _.pick(transactionCreate, [
			"id",
			"transferType",
			"transactionAmount",
		]);

		const transactionResponseFromBank = await this.broker.call(
			"v1.Bank.createRequestPayment",
			{ phone: userInfo.phone, transactionAmount }
		);

		console.log("transactionResponseFromBank", transactionResponseFromBank);

		if (!transactionResponseFromBank) {
			return {
				code: 1001,
				message: this.__(
					updateWalletI18nConstant.ERROR_RESPONSE_FROM_BANK
				),
			};
		}

		// update transaction
		const updatedTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOneAndUpdate",
			[
				{
					"transactionInfo.status":
						updateWalletConstant.TRANSACTION_STATUS.PENDING,
					"transactionInfo.transactionId": randomTransactionId,
				},
				{
					transactionInfoFromSupplier: {
						transactionId:
							transactionResponseFromBank.data.transactionInfo
								.transactionId,
						transactionAmount:
							transactionResponseFromBank.data.transactionInfo
								.transactionAmount,
						status: transactionResponseFromBank.data.transactionInfo
							.status,
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

		return {
			code: 1000,
			data: {
				message: this.__(
					updateWalletI18nConstant.TRANSFER_TRANSACTION_TO_BANK
				),
				userInfo,
				walletInfo,
				transactionInfo: updatedTransaction,
				responseFromBank: transactionResponseFromBank.data,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
