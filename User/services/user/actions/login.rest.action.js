const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const JsonWebToken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const createToken = require("../../../utils/createToken");
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { email, password } = ctx.params.body;

		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ email }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				data: {
					message: "Email không tồn tại!",
				},
			};
		}

		const isMatchPassword = await bcrypt.compare(
			password,
			existingUser.password
		);

		if (!isMatchPassword) {
			return {
				code: 1001,
				data: {
					message: "Mật khẩu không chính xác!",
				},
			};
		}

		const payload = {
			userId: existingUser.id,
			expiredAt: moment(new Date()).add(1, "hour"),
		};

		const userUpdated = await this.broker.call(
			"v1.UserInfoModel.findOneAndUpdate",
			[
				{ id: existingUser.id },
				{
					loginSession: payload,
				},
				{ new: true },
			]
		);

		const accessToken = createToken(payload);

		return {
			code: 1000,
			data: {
				message: "Login thành công!",
				user: { ...userUpdated, password: "" },
				accessToken: accessToken,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
