const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const jwt = require("jsonwebtoken");
const moment = require("moment");
const userSessionConstant = require("../constants/userSession.constant");
const userI18nConstant = require("../constants/userI18n.constant");

module.exports = async function (ctx) {
	try {
		const { rawName } = ctx.span.tags.action;
		const language = ctx.params?.input?.language;

		if (language && language === "en") this.setLocale(language);

		if (this.ServicesNoAuthList.includes(rawName)) return true;

		if (!ctx.meta.auth.credentials.userId) {
			throw new MoleculerError(
				this.__(userI18nConstant.ERROR_TOKEN_MISSING),
				401
			);
		}

		const tokenInfo = jwt.verify(
			ctx.meta.auth.credentials.token,
			process.env.JWT_SECRETKEY
		);

		const userInfo = await this.broker.call("v1.UserInfoModel.findOne", [
			{ id: tokenInfo.userId },
		]);

		if (_.get(userInfo, "id", null) === null) {
			throw new MoleculerError(
				this.__(userI18nConstant.ERROR_TOKEN_FORMAT),
				401
			);
		}

		// check login session
		const now = new Date();
		const loginSession = await this.broker.call(
			"v1.UserSessionModel.findOne",
			[
				{
					userId: tokenInfo.userId,
					deviceId: tokenInfo.deviceId,
					status: userSessionConstant.SESSION_STATUS.ACTIVE,
				},
			]
		);

		console.log("LOGIN SESSION", loginSession);

		if (
			_.get(loginSession, "userId", null) === null ||
			_.get(loginSession, "expiredAt", null) === null
		) {
			throw new MoleculerError(
				this.__(userI18nConstant.ERROR_SESSION_NOT_FOUND),
				401
			);
		}
		if (!moment(loginSession.expiredAt).isAfter(now)) {
			throw new MoleculerError(
				this.__(userI18nConstant.ERROR_TOKEN_EXPIRED),
				401
			);
		}

		if (!moment(loginSession.expiredAt).isSame(tokenInfo.expiredAt)) {
			throw new MoleculerError(
				this.__(userI18nConstant.ERROR_TOKEN_EXPIRED_TIME),
				401
			);
		}
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};

// module.exports = {
// 	name: "AuthDefault",

// 	localAction(next, action) {
// 		return function (ctx) {
// 			console.log("CTX", ctx);
// 			return next(ctx);
// 		};
// 	},
// };
