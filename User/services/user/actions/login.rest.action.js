const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const createToken = require("../../../utils/createToken");
const moment = require("moment");
const userSessionConstant = require("../constants/userSession.constant");
const md5 = require("md5");

module.exports = async function (ctx) {
	try {
		const { email, password, deviceId } = ctx.params.body;

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
		const hashedPassword = md5(password + this.settings.salt);

		if (hashedPassword !== existingUser.password) {
			return {
				code: 1001,
				data: {
					message: "Mật khẩu không chính xác!",
				},
			};
		}

		if (!existingUser.deviceIds.includes(deviceId)) {
			const updatedUser = await this.broker.call(
				"v1.UserInfoModel.findOneAndUpdate",
				[
					{
						id: existingUser.id,
					},
					{
						$push: { deviceIds: deviceId },
					},
					{
						new: true,
					},
				]
			);

			if (_.get(updatedUser, "id", null)) {
				return {
					code: 1001,
					data: {
						message:
							"Cập nhật device không thành công, vui lòng đăng nhập lại!",
					},
				};
			}
		}

		const payload = {
			userId: existingUser.id,
			expiredAt: moment(new Date()).add(1, "hour"),
			deviceId,
		};

		await this.broker.call("v1.UserSessionModel.updateMany", [
			{
				userId: existingUser.id,
				deviceId,
				status: userSessionConstant.SESSION_STATUS.ACTIVE,
			},
			{
				status: userSessionConstant.SESSION_STATUS.EXPIRED,
			},
		]);

		const sessionCreate = await this.broker.call(
			"v1.UserSessionModel.create",
			[payload]
		);

		if (_.get(sessionCreate, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Không thể tạo phiên đăng nhập, vui lòng thử lại",
				},
			};
		}

		const accessToken = createToken(payload);

		const userInfo = _.pick(existingUser, [
			"id",
			"fullName",
			"email",
			"phone",
			"gender",
		]);

		return {
			code: 1000,
			data: {
				message: "Login thành công!",
				userInfo,
				accessToken: accessToken,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
