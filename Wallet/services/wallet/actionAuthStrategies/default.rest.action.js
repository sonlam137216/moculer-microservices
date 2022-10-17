const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const walletConstant = require("../constants/wallet.constant");

module.exports = async function (ctx) {
	try {
		// return true;

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
					status: walletConstant.SESSION_STATUS.ACTIVE,
				},
			]
		);

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
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") {
			console.log("in if", err.code);
			throw new MoleculerError(err.message, err.code);
			// throw err;
		}
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
