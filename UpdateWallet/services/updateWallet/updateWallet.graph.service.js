const _ = require("lodash");
const moleculerI18n = require("moleculer-i18n-js");
const path = require("path");

module.exports = {
	name: "UpdateWalletGraph",

	version: 1,

	mixins: [moleculerI18n],

	i18n: {
		directory: path.join(__dirname, "locales"),
		locales: ["vi", "en"],
		defaultLocale: "vi",
	},

	hooks: {
		before: {
			// "*": ["AuthDefault", "ChangeLanguage"],
			// registerAdmin: ["AuthAdmin"],
		},
	},

	settings: {
		graphql: {
			type: require("./graphql/type"),
			input: require("./graphql/input"),
			enum: require("./graphql/enum"),

			resolvers: {
				UpdateWalletWithdrawSubscription: {
					WithdrawUpdateWalletSubscription: {
						context: true,
						action: "v1.UpdateWalletGraph.withdrawUpdateWalletSubscription",
					},
				},
				UpdateWalletDepositSubscription: {
					DepositUpdateWalletSubscription: {
						context: true,
						action: "v1.UpdateWalletGraph.depositUpdateWalletSubscription",
					},
				},
				UpdateWalletTransferSubscription: {
					TransferUpdateWalletSubscription: {
						context: true,
						action: "v1.UpdateWalletGraph.transferUpdateWalletSubscription",
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
		withdrawUpdateWalletSubscription: {
			graphql: {
				subscription:
					"UpdateWalletWithdrawSubscription: UpdateWalletWithdrawSubscription",
				tags: ["withdrawUpdateWallet"],
			},
			handler: require("./actions/withdrawUpdateWalletSubscription.action"),
		},

		depositUpdateWalletSubscription: {
			graphql: {
				subscription:
					"UpdateWalletDepositSubscription: UpdateWalletDepositSubscription",
				tags: ["depositUpdateWallet"],
			},
			handler: require("./actions/depositUpdateWalletSubscription.action"),
		},

		transferUpdateWalletSubscription: {
			graphql: {
				subscription:
					"UpdateWalletTransferSubscription: UpdateWalletTransferSubscription",
				tags: ["transferUpdateWallet"],
			},
			handler: require("./actions/transferUpdateWalletSubscription.action"),
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
		// AuthDefault: require("./middlewares/auth.default.graph.middleware"),
		// AuthAdmin: require("./middlewares/auth.admin.graph.middleware"),
		// ChangeLanguage: require("./hooks/changeLanguage.graph.hook"),
	},

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
