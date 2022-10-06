"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const moleculerCron = require("moleculer-cron");
const moleculerRabbitmq = require("moleculer-rabbitmq");

const queueMixin = moleculerRabbitmq({
	connection: process.env.RABBITMQ_URI,
	asyncActions: true,
});

module.exports = {
	name: "Payment.rest",

	version: 1,

	mixins: [moleculerCron, queueMixin],

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
	created() {},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {},
};
