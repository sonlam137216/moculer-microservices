const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const accessToken = ctx.meta.token;
		const user = ctx.meta.auth;
		console.log("USER", user);

		const updatedUser = await this.broker.call(
			"v1.UserInfoModel.findOneAndUpdate",
			[
				{
					id: user.credentials.userId,
				},
				{
					loginSession: { userId: null, expiredAt: null },
				},
			]
		);

		if (!updatedUser) {
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
