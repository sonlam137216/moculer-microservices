"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const moleculerCron = require("moleculer-cron");
const moleculerRabbitmq = require("moleculer-rabbitmq");
// const cancelPaymentCronAction = require("./actions/cancelPaymentCron.task.action");

const queueMixin = moleculerRabbitmq({
	connection: process.env.RABBITMQ_URI,
	asyncActions: true,
});

module.exports = {
	name: "Payment",

	version: 1,

	mixins: [moleculerCron, queueMixin],

	// crons
	crons: [
		{
			name: "CANCEL_PAYMENT_AFTER_1_HOUR",
			cronTime: "* */1 * * * *",
			async onTick() {
				try {
					// await this.call("v1.Payment.cancelPaymentTask.async");
					// const payment = await this.broker.call("v1.PaymentInfoModel.findMany", [
					// 	{
					// 		createdAt: { $lt: timeBeforeOneHour },
					// 		status: paymentConstant.PAYMENT_STATUS.UNPAID,
					// 		id: {
					// 			$nin: [queueTest]
					// 		}
					// 	},'', {limit: 10}
					// ]);
					// queue.push(payment)
					// for 1 -10
					// await this.call("v1.Payment.cancelPaymentTask.async", {params: payment[i]});
					await this.call("v1.Payment.cancelPaymentTask.async");
				} catch (err) {
					console.log(err);
				}
			},
		},
	],

	/**
	 * Settings
	 */
	settings: {},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		createPayment: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/Payment/CreatePayment",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					totalPrice: "number",
					description: "string",
					note: "string",
					paymentMethod: "string",
				},
			},

			handler: require("./actions/createPayment.rest.action"),
		},

		verifyPaymentByNapas: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/Payment/VerifyPaymentByNapas",
				auth: {
					strategies: ["Default"],
					mode: "try",
				},
			},

			params: {
				body: {
					$$type: "object",
					success: "boolean",
					paymentInfo: "object",
				},
			},

			handler: require("./actions/verifyPaymentByNapas.rest.action"),
		},

		getPaymentById: {
			rest: {
				method: "GET",
				fullPath: "/v1/External/Payment/GetPaymentById/:id",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {},

			handler: require("./actions/getPaymentById.rest.action"),
		},

		// cron action

		cancelPaymentTask: {
			queue: {
				amqp: {
					prefetch: 1,
				},
				retry: {
					max_retry: 3,
					delay: (retryCount) => retryCount * 5000,
				},
				dedupHash: (ctx) =>
					`Dùng để tránh trùng action (ví dụ nếu cùng dedupHash là 123 thì nó chạy 1 lần thôi`,
			},
			params: {},
			timeout: 60000,
			handler: require("./actions/cancelPaymentTask.task.action"),
		},

		/**
		 * Welcome, a username
		 *
		 * @param {String} name - User name
		 */
		welcome: {
			rest: "/welcome",
			params: {
				name: "string",
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				return `Welcome, ${ctx.params.name}`;
			},
		},
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		// this.queueTest = []
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {},
};
