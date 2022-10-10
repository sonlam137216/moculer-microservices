const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { userId, expiredAt } = ctx.meta.auth.credentials;

		// type is methods update 'ADD' | 'SUB'
		const { type, amount } = ctx.params.body;

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

		let message = "Cập nhật tiền ví không thành công";
		let balanceAvailable = walletInfo.balanceAvailable;
		let isValidBalance = true;

		switch (type) {
			case "ADD": {
				balanceAvailable = walletInfo.balanceAvailable + amount;
				message = "Cộng tiền ví thành công!";
				break;
			}
			case "SUB": {
				balanceAvailable = walletInfo.balanceAvailable - amount;

				if (balanceAvailable < 0) {
					isValidBalance = false;
					message = "Số dư ví hiện tại của ví không dủ";
				} else {
					message = "Trừ tiền ví thành công!";
				}
				break;
			}
			default: {
				message = "Phương thức cập nhật không hợp lệ";
				isValidBalance = false;
				break;
			}
		}

		if (isValidBalance) {
			const updatedWalletInfo = await this.broker.call(
				"v1.WalletInfoModel.findOneAndUpdate",
				[
					{
						id: walletInfo.id,
						ownerId: userId,
					},
					{
						balanceAvailable,
					},
					{
						new: true,
					},
				]
			);

			// udate thành công
			return {
				code: 1000,
				data: {
					message,
					walletInfo: updatedWalletInfo,
				},
			};
		}

		return {
			code: 1001,
			data: {
				message,
			},
		};
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
