const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");
const userSessionConstant = require("../constants/userSession.constant");

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
					status: userSessionConstant.SESSION_STATUS.ACTIVE,
				},
			]
		);
		if (
			_.get(loginSession, "userId", null) === null ||
			_.get(loginSession, "expiredAt", null) === null
		) {
			throw new MoleculerError(401, "Không tìm thấy phiên đăng nhập!");
			// };
		}
		if (!moment(loginSession.expiredAt).isAfter(now)) {
			throw new MoleculerError(401, "Token đã hết hạn!");
		}

		if (!moment(loginSession.expiredAt).isSame(tokenInfo.expiredAt)) {
			throw new MoleculerError(401, "Thời gian expired không đúng!");
		}

		return true;
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
