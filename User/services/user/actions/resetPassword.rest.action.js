const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const md5 = require("md5");
const otpConstant = require("../constants/otp.constant");
const userI18nConstant = require("../constants/userI18n.constant");

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
				message: this.__(userI18nConstant.USER_NOT_EXIST),
			};
		}

		const existingOtp = await this.broker.call("v1.OTPModel.findOne", [
			{ email, status: otpConstant.OTP_STATUS.ACTIVE },
		]);

		if (!existingOtp) {
			return {
				code: 1001,
				message: this.__(userI18nConstant.OTP_NOT_EXIST),
			};
		}

		// check OTP
		const hashOtp = md5(otp);

		if (hashOtp !== existingOtp.otp) {
			return {
				code: 1001,
				message: this.__(userI18nConstant.ERROR_OTP_NOT_MATCH),
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
				message: this.__(userI18nConstant.ERROR_USER_UPDATE),
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
			message: this.__(userI18nConstant.PASSWORD_UPDATE_SUCCESS),
			data: {
				userInfo: updatedUser,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
