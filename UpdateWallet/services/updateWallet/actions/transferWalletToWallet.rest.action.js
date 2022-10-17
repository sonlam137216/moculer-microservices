const _ = require("lodash");
const generateOTP = require("../../../utils/generateOTP");
const generateTransactionId = require("../../../utils/generateTransactionId");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;
const md5 = require("md5");

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

		if (existingSenderWallet.balanceAvailable - amount < 0) {
			return {
				code: 1001,
				data: {
					message:
						"Tài khoản không đủ, vui lòng nạp thêm tiền vào tài khoản!",
				},
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
				data: {
					message: "Tạo transaction không thành công!",
				},
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
				data: {
					message: "Cập nhật OTP không thành công, vui lòng thử lại!",
				},
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
				data: {
					message: "Tạo OTP không thành công, vui lòng thử lại!",
				},
			};
		}
		// return OTP
		return {
			code: 1000,
			data: {
				message:
					"Tạo transaction thành công, vui lòng nhập OTP để xác nhận giao dịch!",
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
