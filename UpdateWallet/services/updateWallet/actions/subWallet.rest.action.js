const _ = require("lodash");
const updateWalletConstant = require("../constant/updateWallet.constant");
const { MoleculerError } = require("moleculer").Errors;
const axios = require("axios");

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;

		// lock = await this.broker.cacher.lock(`accountId_${userId}`, 60 * 1000);

		const { transactionAmount } = ctx.params.body;

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

		// check existing wallet
		const existingWallet = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: userId }]
		);

		if (!existingWallet) {
			return {
				code: 1001,
				data: {
					message: "User chưa tạo ví",
				},
			};
		}

		let balanceAvailable =
			existingWallet.balanceAvailable - transactionAmount;

		if (balanceAvailable < 0) {
			return {
				code: 1001,
				data: {
					message:
						"Số dư hiện tại không đủ, vui lòng nạp thêm tiền vào tài khoản",
				},
			};
		}

		const updateWalletInfo = await this.broker.call(
			"v1.UpdateWalletInfoModel.create",
			[
				{
					userId,
					walletId: existingWallet.id,
					balanceBefore: existingWallet.balanceAvailable,
					balanceAfter: balanceAvailable,
					transferType: updateWalletConstant.WALLET_ACTION_TYPE.SUB,
					transactionAmount,
					status: updateWalletConstant.WALLET_HISTORY_STATUS.PENDING,
				},
			]
		);

		if (_.get(updateWalletInfo, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message:
						"Cập nhật thông tin không thành công, vui lòng thử lại!",
				},
			};
		}

		const userInfo = _.pick(existingUser, ["id", "email", "phone"]);
		const walletInfo = _.pick(updateWalletInfo, [
			"id",
			"transferType",
			"transactionAmount",
		]);

		const transactionResponseFromBank = await axios.post(
			"http://localhost:3000/v1/External/Bank/CreateRequestPayment",
			{ phone: userInfo.phone, transactionAmount }
		);

		if (!transactionResponseFromBank) {
			return {
				code: 1001,
				data: {
					message: "Tạo giao dịch với ngân hàng không thành công!",
				},
			};
		}

		// update transaction
		const updatedTransaction = await this.broker.call(
			"v1.UpdateWalletInfoModel.findOneAndUpdate",
			[
				{
					id: updateWalletInfo.id,
					userId,
					status: updateWalletConstant.WALLET_HISTORY_STATUS.PENDING,
				},
				{
					transactionInfo: {
						transactionId:
							transactionResponseFromBank.data.data
								.transactionInfo.transactionId,
						transactionAmount:
							transactionResponseFromBank.data.data
								.transactionInfo.transactionAmount,
						status: transactionResponseFromBank.data.data
							.transactionInfo.status,
					},
				},
			]
		);

		if (_.get(updatedTransaction, "id", null) === null) {
			return {
				code: 1001,
				data: {
					message: "Cập nhật giao dịch không thành công!",
				},
			};
		}

		return {
			code: 1000,
			data: {
				message: "Gửi thông tin qua ngân hàng!",
				userInfo,
				walletInfo,
				responseFromBank:
					transactionResponseFromBank.data.data.transactionInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
