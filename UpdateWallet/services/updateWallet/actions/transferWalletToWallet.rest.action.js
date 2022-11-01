const _ = require("lodash");
const generateOTP = require("../../../utils/generateOTP");
const generateTransactionId = require("../../../utils/generateTransactionId");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;
const md5 = require("md5");
const updateWalletI18nConstant = require("../constant/updateWalletI18n.constant");

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;
		const { receiverId, amount } = ctx.params.body;

		const existingSenderUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);
		if (_.get(existingSenderUser, "id", null) === null) {
			return {
				code: 1001,
				message: this.__(updateWalletI18nConstant.USER_NOT_EXIST),
			};
		}

		const existingReceiverUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: receiverId }]
		);
		if (_.get(existingReceiverUser, "id", null) === null) {
			return {
				code: 1001,
				message: this.__(updateWalletI18nConstant.RECEIVER_NOT_EXIST),
				data: {},
			};
		}

		const existingSenderWallet = await this.broker.call(
			"v1.Wallet.findWallet",
			{ userId }
		);
		if (_.get(existingSenderWallet, "id", null) === null) {
			return {
				code: 1001,
				message: this.__(updateWalletI18nConstant.ERROR_USER_WALLET),
				data: {},
			};
		}

		const existingReceiverWallet = await this.broker.call(
			"v1.Wallet.findWallet",
			{ userId: receiverId }
		);
		if (_.get(existingReceiverWallet, "id", null) === null) {
			return {
				code: 1001,
				message: this.__(
					updateWalletI18nConstant.ERROR_RECEIVER_WALLET
				),
				data: {},
			};
		}

		if (existingSenderWallet.balanceAvailable - amount < 0) {
			return {
				code: 1001,
				message: this.__(
					updateWalletI18nConstant.ERROR_NOT_ENOUGH_BALANCE
				),
			};
		}

		// create local transaction
		const randomTransactionId = generateTransactionId();
		const transactionCreateObj = {
			walletIdOfSender: existingSenderWallet.id,
			walletIdOfReceiver: existingReceiverWallet.id,
			transactionInfo: {
				transactionId: randomTransactionId,
				transactionAmount: amount,
				status: updateWalletConstant.TRANSACTION_STATUS.PENDING,
				transferType: updateWalletConstant.WALLET_ACTION_TYPE.TRANSFER,
			},
		};
		const transactionCreate = await this.broker.call(
			"v1.UpdateWalletInfoModel.create",
			[transactionCreateObj]
		);

		if (_.get(transactionCreate, "id", null) === null) {
			return {
				code: 1001,
				message: this.__(
					updateWalletI18nConstant.ERROR_TRANSACTION_CREATE
				),
				data: {},
			};
		}

		const otp = generateOTP();
		const hashedOtp = md5(otp);

		// save OTP
		const otpUpdated = await this.broker.call("v1.OTPModel.updateMany", [
			{
				userId,
				status: updateWalletConstant.OTP_STATUS.ACTIVE,
			},
			{
				status: updateWalletConstant.OTP_STATUS.EXPIRED,
			},
		]);

		if (!otpUpdated) {
			return {
				code: 1001,
				message: this.__(updateWalletI18nConstant.ERROR_OTP_UPDATE),
				data: {},
			};
		}

		const otpCreate = await this.broker.call("v1.OTPModel.create", [
			{
				userId,
				otp: hashedOtp,
				transactionId: transactionCreate.transactionInfo.transactionId,
				status: updateWalletConstant.OTP_STATUS.ACTIVE,
			},
		]);

		if (_.get(otpCreate, "id", null) === null) {
			return {
				code: 1001,
				message: this.__(updateWalletI18nConstant.ERROR_OTP_CREATE),
				data: {},
			};
		}
		// return OTP
		return {
			code: 1000,
			message: this.__(
				updateWalletI18nConstant.TRANSACTION_CONFIRM_SUCCESS
			),
			data: {
				otp,
				transactionInfo: transactionCreate,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
