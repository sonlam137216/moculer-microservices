const _ = require("lodash");
const userI18nConstant = require("../constants/userI18n.constant");
const { MoleculerError } = require("moleculer").Errors;
const md5 = require("md5");
const moment = require("moment");
const userSessionConstant = require("../constants/userSession.constant");
const createToken = require("../../../utils/createToken");

module.exports = async function (ctx) {
	try {
		const { email, password, deviceId, language } = ctx.params.input;
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
		const hashedPassword = md5(password + this.settings.salt);

		if (hashedPassword !== existingUser.password) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.WRONG_PASSWORD),
			};
		}

		if (!existingUser.deviceIds.includes(deviceId)) {
			const updatedUser = await this.broker.call(
				"v1.UserInfoModel.findOneAndUpdate",
				[
					{
						id: existingUser.id,
					},
					{
						$push: { deviceIds: deviceId },
					},
					{
						new: true,
					},
				]
			);

			if (_.get(updatedUser, "id", null)) {
				return {
					succeeded: false,
					message: this.__(userI18nConstant.ERROR_UPDATE_DEVICE),
				};
			}
		}

		const payload = {
			userId: existingUser.id,
			expiredAt: moment(new Date()).add(1, "hour"),
			deviceId,
		};

		await this.broker.call("v1.UserSessionModel.updateMany", [
			{
				userId: existingUser.id,
				deviceId,
				status: userSessionConstant.SESSION_STATUS.ACTIVE,
			},
			{
				status: userSessionConstant.SESSION_STATUS.EXPIRED,
			},
		]);

		const sessionCreate = await this.broker.call(
			"v1.UserSessionModel.create",
			[payload]
		);

		if (_.get(sessionCreate, "id", null) === null) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.ERROR_LOGIN_SESSION),
			};
		}

		const accessToken = createToken(payload);

		const userInfo = _.pick(existingUser, [
			"id",
			"fullName",
			"email",
			"phone",
			"gender",
		]);

		return {
			succeeded: true,
			message: this.__(userI18nConstant.LOGIN_SUCCESS),
			userInfo,
			accessToken,
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[USER] login: ${err.message}`);
	}
};
