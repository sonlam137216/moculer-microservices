const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
const walletConstant = require("../constants/wallet.constant");
const walletI18nConstant = require("../constants/walletI18n.constant");

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
				message: this.__(walletI18nConstant.ERROR_SERVICE_FORBIDDEN),
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
				message: this.__(walletI18nConstant.USER_NOT_EXIST),
			};
		}

		const existingReceiverUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: receiverId }]
		);

		if (!existingReceiverUser) {
			return {
				code: 1001,
				message: this.__(walletI18nConstant.RECEIVER_NOT_EXIST),
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
				message: this.__(walletI18nConstant.ERROR_WALLET_NOT_FOUND),
			};
		}

		const walletReceiverInfo = await this.broker.call(
			"v1.WalletInfoModel.findOne",
			[{ ownerId: existingReceiverUser.id }]
		);

		if (!walletReceiverInfo) {
			return {
				code: 1001,
				message: this.__(walletI18nConstant.ERROR_RECEIVER_WALLET),
			};
		}

		let message = this.__(walletI18nConstant.ERROR_UPDATE_WALLET);
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
						message: this.__(
							walletI18nConstant.ERROR_WALLET_HISTORY_CREATE
						),
					};
				}

				message = this.__(walletI18nConstant.WALLET_ADD_SUCCESS);
				tagSubscription = "depositWallet";
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

				message = this.__(walletI18nConstant.WALLET_TRANSFER_SUCCESS);
				tagSubscription = "transferWallet";
				break;
			}
			case walletConstant.WALLET_ACTION_TYPE.SUB: {
				balanceAvailableOfReceiver =
					walletReceiverInfo.balanceAvailable - transactionAmount;

				if (balanceAvailableOfReceiver < 0) {
					isValidBalance = false;
					message = this.__(
						walletI18nConstant.ERROR_NOT_ENOUGH_BALANCE
					);
				} else {
					message = this.__(walletI18nConstant.WALLET_SUB_SUCCESS);
					tagSubscription = "withdrawWallet";
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
						message: this.__(
							walletI18nConstant.ERROR_WALLET_HISTORY_CREATE
						),
					};
				}

				break;
			}
			default: {
				message = this.__(walletI18nConstant.ERROR_WALLET_METHOD);
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
				}

				return {
					code: 1000,
					message: this.__(walletI18nConstant.WALLET_UPDATE_SUCCESS),
				};
			}

			// udate thành công
			return {
				code: 1000,
				message,
				data: {
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
			message,
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
