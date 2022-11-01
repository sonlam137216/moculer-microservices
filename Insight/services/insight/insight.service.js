"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
const moleculerI18n = require("moleculer-i18n-js");
const path = require("path");

module.exports = {
	name: "Insight",

	version: 1,

	mixins: [moleculerI18n],

	i18n: {
		directory: path.join(__dirname, "locales"),
		locales: ["vi", "en"],
		defaultLocale: "vi",
	},

	/**
	 * Settings
	 */
	settings: {},

	hooks: {
		before: {
			"*": ["changeLanguage"],
		},
	},

	methods: {
		changeLanguage: require("./hooks/changeLanguage.rest.hook"),
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		transactionStatisticsByDay: {
			rest: {
				method: "POST",
				fullPath: "/v1/Insight/TransactionStatisticsByDay",
				auth: {
					strategies: ["AuthAdmin"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					method: "string|optional",
					language: "string|optional",
				},
			},
			timeout: 60000,
			handler: require("./actions/transactionStatisticsByDay.rest.action"),
		},

		downloadStatisticsByDayToExcel: {
			rest: {
				method: "POST",
				fullPath: "/v1/Insight/DownloadStatisticsByDayToExcel",
				auth: {
					strategies: ["AuthAdmin"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					method: "string|optional",
					language: "string|optional",
				},
			},
			timeout: 60000,
			handler: require("./actions/exportStatisticsByDayToExcel.rest.action"),
		},

		transactionStatisticsByAccount: {
			rest: {
				method: "POST",
				fullPath: "/v1/Insight/TransactionStatisticsByAccount",
				auth: {
					strategies: ["AuthAdmin"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					method: "string|optional",
					language: "string|optional",
				},
			},
			timeout: 60000,
			handler: require("./actions/transactionStatisticsByAccount.rest.action"),
		},

		downloadStatisticsByAccountIdToExcel: {
			rest: {
				method: "POST",
				fullPath: "/v1/Insight/DownloadStatisticsByAccountIdToExcel",
				auth: {
					strategies: ["AuthAdmin"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					method: "string|optional",
					language: "string|optional",
				},
			},
			timeout: 90000,
			handler: require("./actions/exportStatisticsByAccountToExcel.rest.action"),
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
