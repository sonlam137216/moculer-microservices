const _ = require("lodash");
const createToken = require("../../../utils/createToken");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { email } = ctx.params.body;

		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ email }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				data: {
					message: "Email không tồn tại",
				},
			};
		}

		const payload = {
			userId: existingUser.id,
			expiredAt: moment(new Date()).add(1, "hour"),
		};

		const resetToken = createToken(payload);

		const url = `${process.env.FE_URL}/user/reset/${resetToken}`;

		// send with url
		return {
			code: 1000,
			data: {
				message: "Kiểm tra email để cập nhật mật khẩu mới",
				url,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
