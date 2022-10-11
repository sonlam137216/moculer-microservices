const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const JsonWebToken = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = async function (ctx) {
	try {
		const { email, password, otp } = ctx.params.body;

		// verify email
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ email }]
		);

		if (_.get(existingUser, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "User không tồn tại",
				},
			};
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const updatedUser = await this.broker.call(
			"v1.UserInfoModel.findOneAndUpdate",
			[{ id: userId }, { password: hashedPassword }]
		);

		return {
			code: 1000,
			data: {
				message: "Cập nhật mật khẩu thành công!",
				userInfo: updatedUser,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
