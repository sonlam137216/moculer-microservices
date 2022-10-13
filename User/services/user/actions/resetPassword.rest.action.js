const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const md5 = require("md5");
const otpConstant = require("../constants/otp.constant");

module.exports = async function (ctx) {
	try {
		const { email, password, otp } = ctx.params.body;

		// verify email
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ email }]
		);

		if (_.get(existingUser, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "User không tồn tại",
				},
			};
		}

		const existingOtp = await this.broker.call("v1.OTPModel.findOne", [
			{ email, status: otpConstant.OTP_STATUS.ACTIVE },
		]);

		if (!existingOtp) {
			return {
				code: 1001,
				data: {
					message: "OTP không tồn tại!",
				},
			};
		}

		// check OTP
		const hashOtp = md5(otp);

		if (hashOtp !== existingOtp.otp) {
			return {
				code: 1001,
				data: {
					message: "OTP không trùng khớp",
				},
			};
		}

		const hashedPassword = md5(password);

		const updatedUser = await this.broker.call(
			"v1.UserInfoModel.findOneAndUpdate",
			[{ id: existingUser.id }, { password: hashedPassword }]
		);

		if (_.get(updatedUser, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Đã xảy ra lỗi, cập nhật không thành công!",
				},
			};
		}

		await this.broker.call("v1.OTPModel.findOneAndUpdate", [
			{
				email,
				status: otpConstant.OTP_STATUS.ACTIVE,
			},
			{
				status: otpConstant.OTP_STATUS.EXPIRED,
			},
		]);

		return {
			code: 1000,
			data: {
				message: "Cập nhật mật khẩu thành công!",
				userInfo: updatedUser,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
