const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		console.log("DEFAULT STRATEGIES");
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
			[{ userId: tokenInfo.userId }]
		);
		if (
			_.get(loginSession, "userId", null) === null ||
			_.get(loginSession, "expiredAt", null) === null
		) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy phiên đăng nhập!",
				},
			};
		}
		if (!moment(userInfo.loginSession.expiredAt).isAfter(now)) {
			return {
				code: 1001,
				data: {
					message: "Token đã bị hết hạn",
				},
			};
		}

		return true;
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
