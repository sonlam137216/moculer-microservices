const _ = require("lodash");
const md5 = require("md5");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		// receive OTP
		const { otp, transactionId } = ctx.params.body;
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
				data: {
					message: "Không tìm thấy user!",
				},
			};
		}

		// check transaction
		const existingTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOne",
			[
				{
					userId,
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
			"v1.Wallet.UpdateWallet.async",
			{
				params: { transactionInfo: existingTransaction },
			}
		);

		if (!updatedWallet) {
			return {
				code: 1001,
				data: {
					message: "Cập nhật ví không thành công!",
				},
			};
		}
	} catch (error) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
