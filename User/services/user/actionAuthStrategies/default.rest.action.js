const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		console.log("DEFAULT STRATEGIES");
		const tokenInfo = ctx.params;

		// find user
		const userInfo = await this.broker.call("v1.UserInfoModel.findOne", [
			{ id: tokenInfo.id },
		]);

		console.log("USER INFO", userInfo);

		// check existing user
		if (_.get(userInfo, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không tìm thấy không tin User",
				},
			};
		}

		// check login session
		console.log(
			"CHECK TOKEN",
			moment(userInfo.loginSession.expiredAt).isAfter(now)
		);
		if (moment(userInfo.loginSession.expiredAt).isAfter(now)) {
			return {
				code: 1001,
				data: {
					message: "Token đã bị hết hạn",
				},
			};
		}

		return true;
	} catch (error) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
