const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const insightConstant = require("../constant/insight.constant");
const jwt = require("jsonwebtoken");

module.exports = async function (ctx) {
	try {
		const language = ctx.params?.input?.language;

		if (language && language === "en") this.setLocale(language);

		if (!ctx.meta.auth.credentials.userId) {
			throw new MoleculerError(
				this.__(insightConstant.ERROR_TOKEN_MISSING),
				401
			);
		}

		console.log("auth admin");

		const tokenInfo = jwt.verify(
			ctx.meta.auth.credentials.token,
			process.env.JWT_SECRETKEY
		);

		const userInfo = await this.broker.call("v1.UserInfoModel.findOne", [
			{ id: tokenInfo.userId },
		]);

		if (_.get(userInfo, "id", null) === null) {
			throw new MoleculerError(
				this.__(insightConstant.ERROR_TOKEN_FORMAT),
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
					status: insightConstant.SESSION_STATUS.ACTIVE,
				},
			]
		);

		console.log("LOGIN SESSION", loginSession);

		if (
			_.get(loginSession, "userId", null) === null ||
			_.get(loginSession, "expiredAt", null) === null
		) {
			throw new MoleculerError(
				this.__(insightConstant.ERROR_SESSION_NOT_FOUND),
				401
			);
		}
		if (!moment(loginSession.expiredAt).isAfter(now)) {
			throw new MoleculerError(
				this.__(insightConstant.ERROR_TOKEN_EXPIRED),
				401
			);
		}

		if (!moment(loginSession.expiredAt).isSame(tokenInfo.expiredAt)) {
			throw new MoleculerError(
				this.__(insightConstant.ERROR_TOKEN_EXPIRED_TIME),
				401
			);
		}

		// check role
		if (!userInfo.role || userInfo.role !== insightConstant.ROLE.ADMIN) {
			throw new MoleculerError(
				this.__(insightConstant.ERROR_USER_ROLE),
				403
			);
		}
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
