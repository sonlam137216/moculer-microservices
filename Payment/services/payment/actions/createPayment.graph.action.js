const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
const paymentI18nConstant = require("../constants/paymentI18n.constant");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId, expiredAt } = ctx.meta.auth.credentials;
		const { totalPrice, description, note, paymentMethod } =
			ctx.params.input;

		// check UserID
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (!existingUser) {
			return {
				succeeded: false,
				message: this.__(paymentI18nConstant.USER_NOT_EXIST),
			};
		}

		// check wallet
		const existingWallet = await this.broker.call("v1.Wallet.findWallet", {
			userId,
		});

		if (!existingWallet) {
			return {
				succeeded: false,
				message: this.__(paymentI18nConstant.ERROR_USER_WALLET),
			};
		}

		let message = "";
		let isSuccess = false;
		let walletInfo = {};
		let userInfo = {};
		let paymentInfo = {};
		let url = "";

		// check methods payment
		switch (paymentMethod) {
			case paymentConstant.PAYMENT_METHOD.WALLET: {
				let balanceAvailable =
					existingWallet.balanceAvailable - totalPrice;

				// not enough balance
				if (balanceAvailable < 0) {
					message = this.__(
						paymentI18nConstant.ERROR_NOT_ENOUGH_BALANCE
					);
					break;
				}

				// verify success
				// create payment unpaid
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

				if (_.get(paymentCreate, "id", null) === null) {
					return {
						succeeded: false,
						message: this.__(
							paymentI18nConstant.ERROR_ORDER_CREATE
						),
					};
				}

				// call to UpdateWallet service
				const updatedWallet = await this.broker.call(
					"v1.UpdateWallet.withDrawForPayment",
					{ transactionAmount: totalPrice, userId }
				);

				console.log("updatedWallet", updatedWallet);

				if (!updatedWallet) {
					await this.broker.call(
						"v1.PaymentInfoModel.findOneAndUpdate",
						[
							{ id: paymentCreate.id },
							{ status: paymentConstant.PAYMENT_STATUS.FAILED },
						]
					);
					return {
						succeeded: false,
						message: this.__(
							paymentI18nConstant.ERROR_WALLET_UPDATE
						),
					};
				}

				await this.broker.call("v1.PaymentInfoModel.findOneAndUpdate", [
					{ id: paymentCreate.id },
					{ status: paymentConstant.PAYMENT_STATUS.PAID },
				]);

				isSuccess = true;
				message = this.__(
					paymentI18nConstant.PAY_FOR_BILL_IN_WALLET_SUCCESS
				);
				walletInfo = updatedWallet;
				paymentInfo = _.pick(paymentCreate, [
					"supplierResponse",
					"supplierTransaction",
					"totalPrice",
					"description",
					"note",
					"paymentMethod",
					"status",
					"id",
				]);

				userInfo = _.pick(existingUser, [
					"id",
					"fullName",
					"email",
					"phone",
					"gender",
				]);

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
				message = this.__(paymentI18nConstant.PAY_FOR_BILL_IN_NAPAS);
				walletInfo = existingWallet;
				paymentInfo = paymentCreate;
				// create url
				url = "https://google.com";

				break;
			}
			default: {
				message = this.__(paymentI18nConstant.ERROR_METHOD_PAYMENT);
				break;
			}
		}

		await ctx.broadcast("graphql.publish", {
			tag: "Payment",
			payload: {
				type: "CREATE_PAYMENT",
				accountId: userInfo.id,
				paymentInfo,
			},
		});

		return isSuccess
			? {
					succeeded: true,
					message,
					paymentInfo: { ...paymentInfo, userInfo: userInfo },
					url,
			  }
			: {
					succeeded: false,
					message,
			  };
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
