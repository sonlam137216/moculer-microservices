const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;

		const userInfo = await this.broker.call("v1.UserInfoModel.findOne", [
			{ id: userId },
		]);

		if (!userInfo) {
			return {
				code: 1001,
				data: {
					message: "User không tồn tại!",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Lấy thông tin thành công!",
				userInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
