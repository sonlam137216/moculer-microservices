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
			"*": ["AuthDefault", "ChangeLanguage"],
			registerAdmin: ["AuthAdmin"],
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

					Register: {
						action: "v1.User.graph.register",
					},

					RegisterAdmin: {
						action: "v1.User.graph.registerAdmin",
					},

					UpdateUser: {
						action: "v1.User.graph.updateUser",
					},
					ForgotPassword: {
						action: "v1.User.graph.forgotPassword",
					},
					Logout: {
						action: "v1.User.graph.logout",
					},

					LoginAdmin: {
						action: "v1.User.graph.loginAdmin",
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

		loginAdmin: {
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
			handler: require("./actions/loginAdmin.graph.action"),
		},

		register: {
			params: {
				input: {
					$$type: "object",
					fullName: "string",
					email: "string",
					phone: "string",
					password: "string",
					gender: "string",
					deviceId: "string",
					language: {
						type: "string",
						optional: true,
					},
				},
			},
			handler: require("./actions/register.graph.action"),
		},

		registerAdmin: {
			params: {
				input: {
					$$type: "object",
					fullName: "string",
					email: "string",
					phone: "string",
					password: "string",
					gender: "string",
					deviceId: "string",
					language: {
						type: "string",
						optional: true,
					},
				},
			},
			handler: require("./actions/registerAdmin.graph.action"),
		},

		logout: {
			params: {
				language: {
					type: "string",
					optional: true,
				},
			},
			handler: require("./actions/logout.graph.action"),
		},

		getUserInfo: {
			params: {
				input: {
					$$type: "object",
					language: {
						type: "string",
						optional: true,
					},
				},
			},

			handler: require("./actions/getUserInfo.graph.action"),
		},

		updateUser: {
			params: {
				input: {
					$$type: "object",
					fullName: {
						type: "string",
						optional: true,
					},
					gender: {
						type: "string",
						optional: true,
					},
					language: {
						type: "string",
						optional: true,
					},
				},
			},

			handler: require("./actions/updateUser.graph.action"),
		},

		forgotPassword: {
			params: {
				input: {
					$$type: "object",
					email: "string",
					language: {
						type: "string",
						optional: true,
					},
				},
			},

			handler: require("./actions/forgotPassword.graph.action"),
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
