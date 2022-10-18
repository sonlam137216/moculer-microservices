"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "UpdateWallet",

	version: 1,

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
		deposit: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/UpdateWallet/Deposit",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					transactionAmount: "number",
				},
			},

			handler: require("./actions/deposit.rest.action"),
		},

		withDraw: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/UpdateWallet/WithDraw",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					transactionAmount: "number",
				},
			},

			handler: require("./actions/withDraw.rest.action"),
		},

		verifyTransaction: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/UpdateWallet/VerifyTransaction",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					otp: "string",
					transactionId: "string",
				},
			},

			handler: require("./actions/verifyTransaction.rest.action"),
		},

		transferWalletToWallet: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/UpdateWallet/TransferWalletToWallet",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					receiverId: "number",
					amount: "number",
				},
			},

			handler: require("./actions/transferWalletToWallet.rest.action"),
		},

		verifyOtpWalletToWallet: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/UpdateWallet/VerifyOtpWalletToWallet",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					otp: "string",
					transactionId: "string",
					receiverId: "number",
				},
			},

			handler: require("./actions/verifyOtpWalletToWallet.rest.action"),
		},

		withDrawForPayment: {
			handler: require("./actions/payForBill.rest.action"),
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
