"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "Insight",

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
		// start auth actions
		// adminAuth: {
		// 	registry: {
		// 		auth: {
		// 			name: "AdminAuth",
		// 			jwtKey: "SECRET_KEY_CHANGE_IN_PRODUCTION",
		// 		},
		// 	},
		// 	handler: require(""),
		// },
		// end auth actions

		transactionStatisticsByDay: {
			rest: {
				method: "POST",
				fullPath: "/v1/Insight/TransactionStatisticsByDay",
				auth: {
					strategies: ["AdminAuth"],
					mode: "try",
				},
			},

			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					// method: "string",
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
					strategies: ["AdminAuth"],
					mode: "try",
				},
			},

			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					// method: "string",
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
					strategies: ["AdminAuth"],
					mode: "try",
				},
			},

			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					// method: "string",
				},
			},
			timeout: 90000,
			handler: require("./actions/transactionStatisticsByUser.rest.action"),
		},

		downloadStatisticsByAccountIdToExcel: {
			rest: {
				method: "POST",
				fullPath: "/v1/Insight/DownloadStatisticsByAccountIdToExcel",
				auth: {
					strategies: ["AdminAuth"],
					mode: "try",
				},
			},

			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					// method: "string",
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
