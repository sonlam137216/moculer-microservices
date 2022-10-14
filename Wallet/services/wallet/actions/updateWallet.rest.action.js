const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const walletConstant = require("../constants/wallet.constant");

module.exports = async function (ctx) {
	let lock;
	try {
		const {
			updatedTransaction: { transferType, transactionAmount },
			userId,
		} = ctx.params;

		lock = await this.broker.cacher.lock(`accountId_${userId}`, 60 * 1000);

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

		switch (transferType) {
			case walletConstant.WALLET_ACTION_TYPE.ADD: {
				balanceAvailable =
					walletInfo.balanceAvailable + transactionAmount;
				message = "Cộng tiền ví thành công!";

				// await new Promise((resolve) => {
				// 	setTimeout(() => {
				// 		console.log("ADD");
				// 		resolve();
				// 	}, 10000);
				// });
				break;
			}
			case walletConstant.WALLET_ACTION_TYPE.SUB: {
				balanceAvailable =
					walletInfo.balanceAvailable - transactionAmount;

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

			if (!_.get(updatedWalletInfo, "id", null) === null) {
				return {
					code: 1001,
					data: {
						message: "Không thể cập nhật thông tin ví!",
					},
				};
			}

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
	} finally {
		if (_.isFunction(lock)) {
			await this.broker.cacher.clean(`accountId_${accountId}`);
			lock();
		}
	}
};
