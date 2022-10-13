const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const createToken = require("../../../utils/createToken");
const validateEmail = require("../../../utils/validateEmail");
const validatePhoneNumber = require("../../../utils/validatePhoneNumber");
const moment = require("moment");
const md5 = require("md5");

module.exports = async function (ctx) {
	try {
		const { fullName, email, phone, password, gender, deviceId } =
			ctx.params.body;

		if (!validateEmail(email)) {
			return {
				code: 1001,
				data: {
					message: "Email không hợp lệ!",
				},
			};
		}

		if (!validatePhoneNumber(phone)) {
			return {
				code: 1001,
				data: {
					message: "Số điện thoại không đúng định dạng!",
				},
			};
		}

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

		const hashedPassword = md5(password);

		const createObj = {
			fullName,
			email,
			phone,
			password: hashedPassword,
			gender,
			deviceIds: [deviceId],
		};
		console.log("CREATE", createObj);

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

		const payload = {
			userId: userCreate.id,
			expiredAt: moment(new Date()).add(1, "hour"),
			deviceId,
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

		const userInfo = _.pick(userCreate, [
			"id",
			"fullName",
			"email",
			"phone",
			"gender",
		]);

		return {
			code: 1000,
			data: {
				message: "Tạo tài khoản thành công!",
				accessToken: accessToken,
				userInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);

		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
