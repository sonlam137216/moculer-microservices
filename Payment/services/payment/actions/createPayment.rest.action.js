const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const userId = ctx.meta.auth.credentials.userId;
		const { totalPrice, description, note, paymentMethod } =
			ctx.params.body;

		// check UserID
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				code: 1001,
				data: {
					message: "User không tồn tại!",
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

		// check wallet
		const existingWallet = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: userId }]
		);

		if (!existingWallet) {
			return {
				code: 1001,
				data: {
					message: "User chưa có ví!",
				},
			};
		}

		let message = "";
		let isSuccess = false;
		let walletInfo = {};
		let paymentInfo = {};
		let url = "";

		// check methods payment
		switch (paymentMethod) {
			case paymentConstant.PAYMENT_METHOD.WALLET: {
				let balanceAvailable =
					existingWallet.balanceAvailable - totalPrice;

				// not enough balance
				if (balanceAvailable < 0) {
					message = "Số dư trong ví hiện tại không đủ!";
					break;
				}

				// verify success
				const updatedWallet = await this.broker.call(
					"v1.WalletInfoModel.findOneAndUpdate",
					[
						{
							id: existingWallet.id,
							ownerId: userId,
						},
						{
							balanceAvailable,
						},
						{ new: true },
					]
				);

				console.log("TOTAL PRICE", totalPrice);

				const paymentCreate = await this.broker.call(
					"v1.PaymentInfoModel.create",
					[
						{
							userId,
							totalPrice,
							description,
							note,
							paymentMethod,
							status: paymentConstant.PAYMENT_STATUS.PAID,
						},
					]
				);

				isSuccess = true;
				message = "Bạn đã thanh toán đơn hàng qua ví thành công!";
				walletInfo = updatedWallet;
				paymentInfo = paymentCreate;

				break;
			}
			case paymentConstant.PAYMENT_METHOD.NAPAS: {
				const paymentCreate = await this.broker.call(
					"v1.PaymentInfoModel.create",
					[
						{
							userId,
							totalPrice,
							description,
							note,
							paymentMethod,
							status: paymentConstant.PAYMENT_STATUS.UNPAID,
						},
					]
				);

				isSuccess = true;
				message =
					"Tạo thông tin thanh toán thành công, vui lòng thanh toán để hoàn thành giao dịch!";
				walletInfo = existingWallet;
				paymentInfo = paymentCreate;
				// create url
				url = "https://google.com";

				break;
			}
			default: {
				message = "Phương thức thanh toán không hợp lệ!";
				break;
			}
		}

		return isSuccess
			? {
					code: 1000,
					data: {
						message,
						data: {
							paymentInfo,
							walletInfo,
							url,
						},
					},
			  }
			: {
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
