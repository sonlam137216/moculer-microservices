const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const walletConstant = require("../constants/wallet.constant");

module.exports = async function (ctx) {
	try {
		const tokenInfo = ctx.params;

		const userInfo = await this.broker.call("v1.UserInfoModel.findOne", [
			{ id: tokenInfo.userId },
		]);

		if (_.get(userInfo, "id", null) === null) {
			throw new MoleculerError(401, "Token không hợp lệ!");
		}

		// check login session
		const now = new Date();
		const loginSession = await this.broker.call(
			"v1.UserSessionModel.findOne",
			[
				{
					userId: tokenInfo.userId,
					status: walletConstant.SESSION_STATUS.ACTIVE,
				},
			]
		);
		if (
			_.get(loginSession, "userId", null) === null ||
			_.get(loginSession, "expiredAt", null) === null
		) {
			throw new MoleculerError("Không tìm thấy phiên đăng nhập!", 401);
			// };
		}
		console.log("session", loginSession);
		console.log("expired", loginSession.expiredAt);
		console.log("now", now);

		console.log("compare", moment(loginSession.expiredAt).isAfter(now));
		if (!moment(loginSession.expiredAt).isAfter(now)) {
			throw new MoleculerError("Token đã hết hạn!", 401);
		}

		if (!moment(loginSession.expiredAt).isSame(tokenInfo.expiredAt)) {
			throw new MoleculerError("Thời gian expired không đúng!", 401);
		}

		return true;
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
