const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const md5 = require("md5");
const generateOtp = require("../../../utils/generateOTP");
const otpConstant = require("../constants/otp.constant");
const userI18nConstant = require("../constants/userI18n.constant");

module.exports = async function (ctx) {
	try {
		console.log(ctx.params);
		const { email, language } = ctx.params.input;
		if (language === "en") this.setLocale(language);

		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ email }]
		);

		if (!existingUser) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.USER_NOT_EXIST),
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
				succeeded: false,
				message: this.__(userI18nConstant.ERROR_OTP_CREATE),
			};
		}

		return {
			succeeded: true,
			message: this.__(userI18nConstant.CHECK_EMAIL_TO_UPDATE_PASSWORD),
			otp,
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
