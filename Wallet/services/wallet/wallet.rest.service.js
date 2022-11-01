"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
const moleculerI18n = require("moleculer-i18n-js");
const path = require("path");

const moleculerRabbitmq = require("moleculer-rabbitmq");

const queueMixin = moleculerRabbitmq({
	connection: process.env.RABBITMQ_URI,
	asyncActions: true,
});

module.exports = {
	name: "Wallet",

	version: 1,

	mixins: [queueMixin, moleculerI18n],

	i18n: {
		directory: path.join(__dirname, "locales"),
		locales: ["vi", "en"],
		defaultLocale: "vi",
	},

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

			params: {},

			handler: require("./actions/updateWallet.rest.action"),
		},

		findWallet: {
			handler: require("./actions/findWallet.action"),
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
