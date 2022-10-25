const _ = require("lodash");
const userConstant = require("../constants/user.constant");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const userSessionConstant = require("../constants/userSession.constant");

module.exports = async function (ctx) {
	try {
		const tokenInfo = ctx.params;

		const userInfo = await this.broker.call("v1.UserInfoModel.findOne", [
			{ id: tokenInfo.userId },
		]);

		if (_.get(userInfo, "id", null) === null) {
			throw new MoleculerError("Token không hợp lệ!", 401);
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
			throw new MoleculerError("Không tìm thấy phiên đăng nhập!", 401);
		}
		if (!moment(loginSession.expiredAt).isAfter(now)) {
			throw new MoleculerError("Token đã hết hạn!", 401);
		}

		if (!moment(loginSession.expiredAt).isSame(tokenInfo.expiredAt)) {
			throw new MoleculerError("Thời gian expired không đúng!", 401);
		}

		// check role
		if (!userInfo.role || userInfo.role !== userConstant.ROLE.ADMIN) {
			throw new MoleculerError("Bạn không có quyền truy cập!", 403);
		}
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
