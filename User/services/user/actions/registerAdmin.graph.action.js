const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const createToken = require("../../../utils/createToken");
const validateEmail = require("../../../utils/validateEmail");
const validatePhoneNumber = require("../../../utils/validatePhoneNumber");
const moment = require("moment");
const md5 = require("md5");
const userConstant = require("../constants/user.constant");
const userI18nConstant = require("../constants/userI18n.constant");

module.exports = async function (ctx) {
	try {
		const { fullName, email, phone, password, gender, deviceId } =
			ctx.params.input;

		if (!validateEmail(email)) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.ERROR_EMAIL_FORMAT),
			};
		}

		if (!validatePhoneNumber(phone)) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.ERROR_PHONE_FORMAT),
			};
		}

		const existingEmailOrPhone = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ $or: [{ email }, { phone }] }]
		);

		if (existingEmailOrPhone) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.EMAIL_OR_PHONE_EXISTED),
			};
		}

		const hashedPassword = md5(password + this.settings.salt);

		const createObj = {
			fullName,
			email,
			phone,
			password: hashedPassword,
			gender,
			role: userConstant.ROLE.ADMIN,
			deviceIds: [deviceId],
		};

		const userCreate = await this.broker.call("v1.UserInfoModel.create", [
			createObj,
		]);

		if (_.get(userCreate, "id", null) === null) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.ERROR_USER_CREATE),
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
				succeeded: false,
				message: this.__(userI18nConstant.ERROR_LOGIN_SESSION),
			};
		}

		// const accessToken = createToken(payload);

		const userInfo = _.pick(userCreate, [
			"id",
			"fullName",
			"email",
			"phone",
			"gender",
		]);

		return {
			succeeded: true,
			message: this.__(userI18nConstant.USER_CREATE_SUCCESS),
			data: {
				userInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
