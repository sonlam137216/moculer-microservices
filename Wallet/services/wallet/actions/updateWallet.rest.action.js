const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const walletConstant = require("../constants/wallet.constant");

module.exports = async function (ctx) {
	console.log("CTX", ctx);
	let lock;
	let accountId;
	try {
		const {
			transactionInfo: {
				transactionInfo: {
					transferType,
					transactionAmount,
					transactionId,
				},
			},
			receiverId,
			senderId,
			serviceName,
		} = ctx.params;

		if (!walletConstant.SERVICE_NAME_LIST[serviceName]) {
			return {
				code: 1001,
				data: {
					message: "Service không có trong danh sách",
				},
			};
		}

		accountId = receiverId;

		// lock
		lock = await this.broker.cacher.lock(
			`accountId_${accountId}`,
			60 * 1000
		);

		const existingSenderUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: senderId }]
		);

		if (!existingSenderUser) {
			return {
				code: 1001,
				data: {
					message: "Sender user không tồn tại",
				},
			};
		}

		const existingReceiverUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: receiverId }]
		);

		if (!existingReceiverUser) {
			return {
				code: 1001,
				data: {
					message: "Sender user không tồn tại",
				},
			};
		}

		// check existing wallet
		const walletSenderInfo = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: existingSenderUser.id }]
		);

		if (!walletSenderInfo) {
			return {
				code: 1001,
				data: {
					message: "Sender chưa tạo ví",
				},
			};
		}

		const walletReceiverInfo = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: existingReceiverUser.id }]
		);

		if (!walletReceiverInfo) {
			return {
				code: 1001,
				data: {
					message: "Receiver chưa tạo ví",
				},
			};
		}

		console.log("walletSenderInfo", walletSenderInfo);
		console.log("walletReceiverInfo", walletReceiverInfo);

		let message = "Cập nhật tiền ví không thành công";
		let balanceAvailableOfSender = walletSenderInfo.balanceAvailable;
		let balanceAvailableOfReceiver = walletReceiverInfo.balanceAvailable;
		let walletHistoryOfSender;
		let walletHistoryOfReceiver;
		let isValidBalance = true;

		switch (transferType) {
			case walletConstant.WALLET_ACTION_TYPE.ADD: {
				balanceAvailableOfReceiver =
					walletReceiverInfo.balanceAvailable + transactionAmount;
				walletHistoryOfReceiver = await this.broker.call(
					"v1.WalletHistoryModel.create",
					[
						{
							userId: receiverId,
							walletId: existingReceiverUser.id,
							balanceBefore: walletReceiverInfo.balanceAvailable,
							balanceAfter: balanceAvailableOfReceiver,
							transferType: walletConstant.WALLET_ACTION_TYPE.ADD,
							transactionId,
							status: walletConstant.WALLET_HISTORY_STATUS
								.PENDING,
						},
					]
				);

				if (_.get(walletHistoryOfReceiver, "id", null) === null) {
					return {
						code: 1001,
						data: {
							message: "Tạo lịch sử không thành công!",
						},
					};
				}

				message = "Cộng tiền ví thành công!";
				break;
			}
			case walletConstant.WALLET_ACTION_TYPE.TRANSFER: {
				balanceAvailableOfSender =
					walletSenderInfo.balanceAvailable - transactionAmount;

				balanceAvailableOfReceiver =
					walletReceiverInfo.balanceAvailable + transactionAmount;

				// history of sender
				walletHistoryOfSender = await this.broker.call(
					"v1.WalletHistoryModel.create",
					[
						{
							userId: senderId,
							walletId: existingSenderUser.id,
							balanceBefore: walletSenderInfo.balanceAvailable,
							balanceAfter: balanceAvailableOfSender,
							transferType:
								walletConstant.WALLET_ACTION_TYPE.TRANSFER,
							transactionId,
							status: walletConstant.WALLET_HISTORY_STATUS
								.PENDING,
						},
					]
				);
				// history of receiver
				walletHistoryOfReceiver = await this.broker.call(
					"v1.WalletHistoryModel.create",
					[
						{
							userId: receiverId,
							walletId: existingReceiverUser.id,
							balanceBefore: walletReceiverInfo.balanceAvailable,
							balanceAfter: balanceAvailableOfReceiver,
							transferType:
								walletConstant.WALLET_ACTION_TYPE.TRANSFER,
							transactionId,
							status: walletConstant.WALLET_HISTORY_STATUS
								.PENDING,
						},
					]
				);

				console.log("walletHistoryOfReceiver", walletHistoryOfReceiver);

				message = "Chuyển tiền thành công!";
				break;
			}
			case walletConstant.WALLET_ACTION_TYPE.SUB: {
				balanceAvailableOfReceiver =
					walletReceiverInfo.balanceAvailable - transactionAmount;

				if (balanceAvailableOfReceiver < 0) {
					isValidBalance = false;
					message = "Số dư ví hiện tại của ví không dủ";
				} else {
					message = "Trừ tiền ví thành công!";
				}

				// create history
				walletHistoryOfReceiver = await this.broker.call(
					"v1.WalletHistoryModel.create",
					[
						{
							userId: receiverId,
							walletId: existingReceiverUser.id,
							balanceBefore: walletReceiverInfo.balanceAvailable,
							balanceAfter: balanceAvailableOfReceiver,
							transferType: walletConstant.WALLET_ACTION_TYPE.SUB,
							transactionId,
							status: walletConstant.WALLET_HISTORY_STATUS
								.PENDING,
						},
					]
				);

				if (_.get(walletHistoryOfReceiver, "id", null) === null) {
					return {
						code: 1001,
						data: {
							message: "Tạo lịch sử không thành công!",
						},
					};
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
			let updatedWalletSenderInfo;
			let updatedWalletReceiverInfo;

			if (transferType === walletConstant.WALLET_ACTION_TYPE.TRANSFER) {
				updatedWalletSenderInfo = await this.broker.call(
					"v1.WalletInfoModel.findOneAndUpdate",
					[
						{
							id: walletSenderInfo.id,
							ownerId: senderId,
						},
						{
							balanceAvailable: balanceAvailableOfSender,
						},
						{
							new: true,
						},
					]
				);

				updatedWalletReceiverInfo = await this.broker.call(
					"v1.WalletInfoModel.findOneAndUpdate",
					[
						{
							id: walletReceiverInfo.id,
							ownerId: receiverId,
						},
						{
							balanceAvailable: balanceAvailableOfReceiver,
						},
						{
							new: true,
						},
					]
				);
			} else {
				updatedWalletReceiverInfo = await this.broker.call(
					"v1.WalletInfoModel.findOneAndUpdate",
					[
						{
							id: walletReceiverInfo.id,
							ownerId: receiverId,
						},
						{
							balanceAvailable: balanceAvailableOfReceiver,
						},
						{
							new: true,
						},
					]
				);
			}

			console.log("updatedWalletSenderInfo", updatedWalletSenderInfo);
			console.log("updatedWalletReceiverInfo", updatedWalletReceiverInfo);

			if (_.get(updatedWalletReceiverInfo, "id", null) !== null) {
				// update histories
				if (_.get(walletHistoryOfSender, "id", null) !== null) {
					walletHistoryOfSender = await this.broker.call(
						"v1.WalletHistoryModel.findOneAndUpdate",
						[
							{
								userId: senderId,
								walletId: existingSenderUser.id,
								status: walletConstant.WALLET_HISTORY_STATUS
									.PENDING,
								transactionId,
							},
							{
								status: walletConstant.WALLET_HISTORY_STATUS
									.SUCCEEDED,
							},
							{
								new: true,
							},
						]
					);
				}

				if (_.get(walletHistoryOfReceiver, "id", null) !== null) {
					walletHistoryOfReceiver = await this.broker.call(
						"v1.WalletHistoryModel.findOneAndUpdate",
						[
							{
								userId: receiverId,
								walletId: existingReceiverUser.id,
								status: walletConstant.WALLET_HISTORY_STATUS
									.PENDING,
								transactionId,
							},
							{
								status: walletConstant.WALLET_HISTORY_STATUS
									.SUCCEEDED,
							},
							{
								new: true,
							},
						]
					);

					console.log(
						"walletHistoryOfReceiver",
						walletHistoryOfReceiver
					);
				}

				return {
					code: 1000,
					data: {
						message: "cập nhật thành công!",
					},
				};
			}

			// udate thành công
			return {
				code: 1000,
				data: {
					message,
					walletInfo: updatedWalletReceiverInfo,
				},
			};
		}

		if (_.get(walletHistoryOfSender, "id", null) !== null) {
			walletHistoryOfSender = await this.broker.call(
				"v1.WalletHistoryModel.findOneAndUpdate",
				[
					{
						userId: senderId,
						walletId: existingSenderUser.id,
						status: walletConstant.WALLET_HISTORY_STATUS.PENDING,
					},
					{
						status: walletConstant.WALLET_HISTORY_STATUS.FAILED,
					},
				]
			);
		}

		if (_.get(walletHistoryOfReceiver, "id", null) !== null) {
			walletHistoryOfReceiver = await this.broker.call(
				"v1.WalletHistoryModel.findOneAndUpdate",
				[
					{
						userId: receiverId,
						walletId: existingReceiverUser.id,
						status: walletConstant.WALLET_HISTORY_STATUS.PENDING,
					},
					{
						status: walletConstant.WALLET_HISTORY_STATUS.FAILED,
					},
				]
			);
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
			// await this.broker.cacher.clean(`accountId_${accountId}`);
			lock();
		}
	}
};
