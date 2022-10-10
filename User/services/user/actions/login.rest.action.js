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

		const sessionCreate = await this.broker.call(
			"v1.UserSessionModel.create",
			[payload]
		);

		if (_.get(sessionCreate, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message:
						"Không thể tạo phiên đăng nhập, vui lòng đăng nhập lại",
				},
			};
		}

		const accessToken = createToken(payload);

		return {
			code: 1000,
			data: {
				message: "Login thành công!",
				user: existingUser,
				accessToken: accessToken,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
