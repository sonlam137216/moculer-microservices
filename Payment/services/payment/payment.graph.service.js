const _ = require("lodash");
const moleculerI18n = require("moleculer-i18n-js");
const path = require("path");

module.exports = {
	name: "User.graph",

	version: 1,

	mixins: [moleculerI18n],

	i18n: {
		directory: path.join(__dirname, "locales"),
		locales: ["vi", "en"],
		defaultLocale: "vi",
	},

	hooks: {
		before: {
			"*": "AuthDefault",
			// registerAdmin: ["AuthAdmin"],
		},
		// error: {
		// 	"*": function (ctx, error) {
		// 		return {
		// 			data: [],
		// 			succeeded: false,
		// 			message: error.message || String(error),
		// 		};
		// 	},
		// },
	},

	settings: {
		graphql: {
			type: require("./graph/type"),
			input: require("./graph/input"),
			enum: require("./graph/enum"),

			resolvers: {
				UserMutation: {
					Login: {
						action: "v1.User.graph.login",
					},
				},
				UserQuery: {
					GetUserInfo: {
						action: "v1.User.graph.getUserInfo",
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
		login: {
			params: {
				input: {
					$$type: "object",
					email: "string",
					password: "string",
					deviceId: "string",
					language: {
						type: "string",
						optional: true,
					},
				},
			},
			handler: require("./actions/login.graph.action"),
		},

		UserOps: {
			graphql: {
				mutation: "UserMutation: UserMutation",
				query: "UserQuery: UserQuery",
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
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		this.ServicesNoAuthList = [];
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
