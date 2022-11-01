const _ = require("lodash");
const moleculerI18n = require("moleculer-i18n-js");
const path = require("path");

module.exports = {
	name: "Insight.graph",

	version: 1,

	mixins: [moleculerI18n],

	i18n: {
		directory: path.join(__dirname, "locales"),
		locales: ["vi", "en"],
		defaultLocale: "vi",
	},

	hooks: {
		before: {
			// "*": "AuthDefault",
			"*": ["AuthAdmin", "changeLanguage"],
		},
	},

	settings: {
		graphql: {
			type: require("./graph/type"),
			input: require("./graph/input"),
			enum: require("./graph/enum"),

			resolvers: {
				InsightMutation: {
					Hello: {
						action: "v1.Insight.graph.hello",
					},
				},
				InsightQuery: {
					GetTransactionStatisticsByDay: {
						action: "v1.Insight.graph.getTransactionStatisticsByDay",
					},
					GetTransactionStatisticsByAccount: {
						action: "v1.Insight.graph.getTransactionStatisticsByAccount",
					},
					ExportToExcelTransactionStatisticsByDay: {
						action: "v1.Insight.graph.exportToExcelTransactionStatisticsByDay",
					},
				},
			},
		},
		salt: "secret_salt",
	},

	/**
	 * Dependencies
	 */
	dependencies: [],
	/**
	 * Actions
	 */
	actions: {
		getTransactionStatisticsByDay: {
			handler: require("./actions/transactionStatisticsByDay.graph.action"),
		},

		GetTransactionStatisticsByAccount: {
			handler: require("./actions/transactionStatisticsByAccount.graph.action"),
		},

		exportToExcelTransactionStatisticsByDay: {
			handler: require("./actions/exportStatisticsByDayToExcel.graph.action"),
		},

		hello: {
			handler: require("./actions/hello.graph.action"),
		},

		InsightOps: {
			graphql: {
				mutation: "InsightMutation: InsightMutation",
				query: "InsightQuery: InsightQuery",
			},
			handler(ctx) {
				return true;
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
	// methods: {},

	methods: {
		AuthDefault: require("./middlewares/auth.default.graph.middleware"),
		AuthAdmin: require("./middlewares/auth.admin.graph.middleware"),
		changeLanguage: require("./hooks/changeLanguage.graph.hook"),
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		this.ServicesNoAuthList = [
			"login",
			"register",
			"UserOps",
			"InsightOps",
			"forgotPassword",
		];
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
