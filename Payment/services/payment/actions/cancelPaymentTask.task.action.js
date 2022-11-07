const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");
const MoleculerError = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		let currentTime = new Date(Date.now());
		let timeBeforeOneHour = new Date(
			currentTime.setHours(currentTime.getHours() - 1)
		).toISOString();

		const payments = await this.broker.call(
			"v1.PaymentInfoModel.findMany",
			[
				{
					createdAt: { $lt: timeBeforeOneHour },
					status: paymentConstant.PAYMENT_STATUS.UNPAID,
					id: {
						$nin: this.queuePaymentIds,
					},
				},
				"",
				{ limit: 2 },
			]
		);

		payments.forEach((payment) => {
			this.queuePaymentIds.push(payment.id);
		});

		await Promise.all(
			payments.map(async (payment) => {
				const updatedPayment = await this.broker.call(
					"v1.PaymentInfoModel.findOneAndUpdate",
					[
						{
							createdAt: { $lt: timeBeforeOneHour },
							id: { $in: this.queuePaymentIds },
							status: paymentConstant.PAYMENT_STATUS.UNPAID,
						},
						{
							status: paymentConstant.PAYMENT_STATUS.EXPIRED,
						},
						{
							new: true,
						},
					]
				);

				if (updatedPayment) {
					const index = this.queuePaymentIds.indexOf(
						updatedPayment.id
					);
					if (index > -1) {
						this.queuePaymentIds.splice(index, 1);
					}
				}

				await ctx.broadcast("graphql.publish", {
					tag: "Payment",
					payload: {
						type: "CANCEL_PAYMENT",
						accountId: updatedPayment.userId,
						paymentInfo: updatedPayment,
					},
				});
			})
		);
	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
