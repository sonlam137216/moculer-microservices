const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const JsonWebToken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const createToken = require("../../../utils/createToken");
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { fullName, email, phone, password, gender } = ctx.params.body;

		const existingEmailOrPhone = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ $or: [{ email }, { phone }] }]
		);

		if (existingEmailOrPhone) {
			return {
				code: 1001,
				data: {
					message: "Email hoặc số điện thoại đã tồn tại",
				},
			};
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const createObj = {
			fullName,
			email,
			phone,
			password: hashedPassword,
			gender,
		};

		const userCreate = await this.broker.call("v1.UserInfoModel.create", [
			createObj,
		]);

		if (_.get(userCreate, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Tạo tài khoản không thành công",
				},
			};
		}

		// create login session
		let loginSession = {
			userId: userCreate.id,
			expiredAt: moment(new Date()).add(1, "hour").toISOString(),
		};

		const userUpdated = await this.broker.call(
			"v1.UserInfoModel.findOneAndUpdate",
			[
				{ id: userCreate.id },
				{
					loginSession,
				},
				{ new: true },
			]
		);

		if (_.get(userUpdated, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Tạo phiên đăng nhập không thành công!",
				},
			};
		}

		const payload = {
			userId: userCreate.id,
			expiredAt: moment(new Date()).add(1, "hour"),
		};

		const accessToken = createToken(payload);

		return {
			code: 1000,
			data: {
				message: "Tạo tài khoản thành công!",
				accessToken: accessToken,
				user: userUpdated,
			},
		};
	} catch (err) {
		console.log("ERR", err);

		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
