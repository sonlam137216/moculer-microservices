const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const md5 = require("md5");
const generateOtp = require("../../../utils/generateOTP");
const otpConstant = require("../constants/otp.constant");

module.exports = async function (ctx) {
	try {
		const { email } = ctx.params.body;

		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ email }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				data: {
					message: "Email không tồn tại",
				},
			};
		}

		await this.broker.call("v1.OTPModel.updateMany", [
			{
				email,
			},
			{
				status: otpConstant.OTP_STATUS.EXPIRED,
			},
		]);

		const otp = generateOtp();
		console.log("OTP", otp);
		// hash OTP
		const hashOtp = md5(otp);
		// send OTP

		const otpCreate = await this.broker.call("v1.OTPModel.create", [
			{
				email,
				otp: hashOtp,
				status: otpConstant.OTP_STATUS.ACTIVE,
			},
		]);

		if (!otpCreate) {
			return {
				code: 1001,
				data: {
					message: "Tạo otp không thành công",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Kiểm tra email để cập nhật mật khẩu mới",
				otp,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
