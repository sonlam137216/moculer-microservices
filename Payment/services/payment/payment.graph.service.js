const _ = require("lodash");
const moleculerI18n = require("moleculer-i18n-js");
const path = require("path");
const { withFilter } = require("graphql-subscriptions");

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
				PaymentSubscription: {
					PaymentSub: {
						context: true,
						action: "v1.PaymentGraph.paymentSub",
						rootParams: {
							payload: "payload",
						},
					},
				},

				// PaymentCreateSubscription: {
				// 	CreatePaymentSubscription: {
				// 		context: true,
				// 		action: "v1.PaymentGraph.createPaymentSubscription",
				// 	},
				// },
				// PaymentCancelSubscription: {
				// 	CancelPaymentSubscription: {
				// 		context: true,
				// 		action: "v1.PaymentGraph.cancelPaymentSubscription",
				// 	},
				// },
				// PaymentVerifyByNapasSubscription: {
				// 	VerifyByNapasPaymentSubscription: {
				// 		context: true,
				// 		action: "v1.PaymentGraph.verifyByNapasPaymentSubscription",
				// 	},
				// },
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
		// payloadCreate: {
		// 	handler: require("./actions/payloadCreate.action"),
		// },
		createPayment: {
			handler: require("./actions/createPayment.graph.action"),
		},
		filterAccountId: {
			handler: require("./actions/filterAccountId.subscription.action"),
		},
		paymentSubscription: {
			graphql: {
				subscription:
					"PaymentSubscription(accountId: Int!): PaymentSubscription",
				tags: ["Payment"],
				filter: "v1.PaymentGraph.filterAccountId",
			},
			handler(ctx) {
				return {
					payload: ctx.params.payload,
				};
			},
		},

		paymentSub: {
			handler: require("./actions/paymentSub.action"),
		},

		createPaymentSubscription: {
			// graphql: {
			// 	subscription:
			// 		"PaymentCreateSubscription: PaymentCreateSubscription",
			// 	tags: ["createPayment"],
			// },
			handler: require("./actions/createPaymentSubscription.action"),
		},

		cancelPaymentSubscription: {
			// graphql: {
			// 	subscription:
			// 		"PaymentCancelSubscription: PaymentCancelSubscription",
			// 	tags: ["cancelPayment"],
			// },
			handler: require("./actions/cancelPaymentSubscription.action"),
		},

		verifyByNapasPaymentSubscription: {
			handler: require("./actions/verifyPaymentByNapasSubscription.action"),
		},

		getPaymentById: {
			handler: require("./actions/getPaymentById.graph.action"),
		},

		PaymentOps: {
			graphql: {
				mutation: "PaymentMutation: PaymentMutation",
				query: "PaymentQuery: PaymentQuery",
			},
			handler(ctx) {
				// console.log("ctx :>> ", ctx);
				return true;
			},
		},

		// PaymentSubscriptionOps: {
		// 	graphql: {
		// 		subscription: "PaymentSubscription: PaymentSubscription",
		// 		tags: ["UNION"],
		// 	},
		// 	handler(ctx) {
		// 		console.log("SocketBoGraph >>> ", ctx.params);
		// 		_.set(this, "payload", ctx.params.payload);
		// 		return ctx.params.payload;
		// 		// return ctx;
		// 	},
		// },
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
			"payloadCreate",
			"PaymentSubscriptionOps",
			"filterAccountId",
			"paymentSubscription",
			"paymentSub",
		];
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		// setInterval(async () => {
		// 	try {
		// 		const rs = await this.broker.broadcast("graphql.publish", {
		// 			tag: "UNION_TEST",
		// 			payload: {
		// 				__typename: "Socket1",
		// 				message: "Tạo đơn hàng!",
		// 			},
		// 		});
		// 		console.log("rs", rs);
		// 	} catch (error) {
		// 		console.log("error :>> ", error);
		// 	}
		// }, 3000);
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {},
};
