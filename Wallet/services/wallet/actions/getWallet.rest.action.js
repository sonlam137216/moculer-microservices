const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { userId, expiredAt } = ctx.meta.auth.credentials;

		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				data: {
					message: "User không tồn tại",
				},
			};
		}

		// check login session
		const now = new Date();
		if (
			existingUser.loginSession.userId === null ||
			existingUser.loginSession.expiredAt === null
		) {
			return {
				code: 1001,
				data: {
					message: "Phiên đăng nhập đã hết, hãy đăng nhập lại!",
				},
			};
		}

		if (!moment(existingUser.loginSession.expiredAt).isAfter(now)) {
			return {
				code: 1001,
				data: {
					message: "Token đã bị hết hạn",
				},
			};
		}

		if (
			!moment(existingUser.loginSession.expiredAt).isSame(
				moment(expiredAt)
			)
		) {
			return {
				code: 1001,
				data: {
					message: "Token không đúng thời gian expired time",
				},
			};
		}

		// check exiting wallet
		const walletInfo = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: userId }]
		);

		if (!walletInfo) {
			return {
				code: 1001,
				data: {
					message: "User chưa tạo ví",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Lấy thông tin thành công",
				walletInfo,
			},
		};
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
