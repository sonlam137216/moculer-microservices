const _ = require("lodash");
const userSessionConstant = require("../../userSession/constants/userSession.constant");
const userI18nConstant = require("../constants/userI18n.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId, deviceId } = ctx.meta.auth.credentials;

		const language = ctx.params?.input?.language;

		if (language && language === "en") this.setLocale(language);

		const updatedUserSession = await this.broker.call(
			"v1.UserSessionModel.findOneAndUpdate",
			[
				{
					userId,
					deviceId,
					status: userSessionConstant.SESSION_STATUS.ACTIVE,
				},
				{
					status: userSessionConstant.SESSION_STATUS.EXPIRED,
				},
			]
		);

		if (!updatedUserSession) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.ERROR_USER_LOGOUT),
			};
		}

		return {
			succeeded: true,
			message: this.__(userI18nConstant.USER_LOGOUT_SUCCESS),
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
