"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "Wallet",

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
		// start auth actions
		default: {
			registry: {
				auth: {
					name: "Default",
					jwtKey: "SECRET_KEY_CHANGE_IN_PRODUCTION",
				},
			},
			handler: require("./actionAuthStrategies/default.rest.action"),
		},
		// end auth actions
		createWallet: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/Wallet/CreateWallet",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					paymentMethods: "array",
				},
			},

			handler: require("./actions/createWallet.rest.action"),
		},

		getWalletInfo: {
			rest: {
				method: "GET",
				fullPath: "/v1/External/Wallet/GetWalletInfo",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {},

			handler: require("./actions/getWallet.rest.action"),
		},

		updateWallet: {
			queue: {
				amqp: {
					prefetch: 1,
				},
				retry: {
					max_retry: 3,
					delay: (retryCount) => retryCount * 5000,
				},
				dedupHash: (ctx) =>
					`Dùng để tránh trùng action (ví dụ nếu cùng dedupHash là 123 thì nó chạy 1 lần thôi)`,
			},
			timeout: 60000,

			rest: {
				method: "POST",
				fullPath: "/v1/External/Wallet/UpdateWallet",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {},

			handler: require("./actions/updateWallet.rest.action"),
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
