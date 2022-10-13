const _ = require("lodash");
const userSessionConstant = require("../../userSession/constants/userSession.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId, deviceId } = ctx.meta.auth.credentials;

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
				code: 1001,
				data: {
					message: "Logout không thành công!",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Logout thành công!",
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
