const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const md5 = require("md5");
const generateOtp = require("../../../utils/generateOTP");

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

		const otp = generateOtp();
		console.log("OTP", otp);
		// hash OTP
		const hashOtp = md5(otp);
		// send OTP

		const otpCreate = await this.broker.call("v1.OTPModel.create", [
			{
				email,
				otp: hashOtp,
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
