const _ = require("lodash");
const moleculerI18n = require("moleculer-i18n-js");
const path = require("path");

module.exports = {
	name: "PaymentGraph",

	version: 1,

	mixins: [moleculerI18n],

	i18n: {
		directory: path.join(__dirname, "locales"),
		locales: ["vi", "en"],
		defaultLocale: "vi",
	},

	hooks: {
		before: {
			"*": ["AuthDefault", "ChangeLanguage"],
			// registerAdmin: ["AuthAdmin"],
		},
	},

	settings: {
		graphql: {
			type: require("./graph/type"),
			input: require("./graph/input"),
			enum: require("./graph/enum"),

			resolvers: {
				PaymentMutation: {
					CreatePayment: {
						action: "v1.PaymentGraph.createPayment",
					},
				},
				PaymentQuery: {
					GetPaymentById: {
						action: "v1.PaymentGraph.getPaymentById",
					},
				},
				PaymentCreateSubscription: {
					CreatePaymentSubscription: {
						context: true,
						action: "v1.PaymentGraph.createPaymentSubscription",
					},
				},
				PaymentCancelSubscription: {
					CancelPaymentSubscription: {
						context: true,
						action: "v1.PaymentGraph.cancelPaymentSubscription",
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
		createPayment: {
			handler: require("./actions/createPayment.graph.action"),
		},
		createPaymentSubscription: {
			graphql: {
				subscription:
					"PaymentCreateSubscription: PaymentCreateSubscription",
				tags: ["createPayment"],
			},
			handler: require("./actions/createPaymentSubscription.action"),
		},

		cancelPaymentSubscription: {
			graphql: {
				subscription:
					"PaymentCancelSubscription: PaymentCancelSubscription",
				tags: ["cancelPayment"],
			},
			handler: require("./actions/cancelPaymentSubscription.action"),
		},

		getPaymentById: {
			handler: require("./actions/getPaymentById.graph.action"),
		},

		PaymentOps: {
			graphql: {
				mutation: "PaymentMutation: PaymentMutation",
				query: "PaymentQuery: PaymentQuery",
				// subscription:
				// 	"PaymentCreateSubscription: PaymentCreateSubscription",
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
		ChangeLanguage: require("./hooks/changeLanguage.graph.hook"),
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		this.ServicesNoAuthList = [
			"login",
			"register",
			"UserOps",
			"forgotPassword",
			"loginAdmin",
			"createPaymentSubscription",
			"cancelPaymentSubscription",
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
