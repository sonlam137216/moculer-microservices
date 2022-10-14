"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "Bank",

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
		createRequestPayment: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/Bank/CreateRequestPayment",
				auth: false,
			},

			params: {
				body: {
					$$type: "object",
					phone: "string",
					transactionAmount: "number",
				},
			},
			handler: require("./actions/createRequestPayment.rest.action"),
		},

		verifyRequestPayment: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/Bank/VerifyRequestPayment",
				auth: false,
			},

			params: {
				body: {
					$$type: "object",
					otp: "string",
					transactionId: "string",
				},
			},
			handler: require("./actions/verifyRequestPayment.rest.action"),
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
