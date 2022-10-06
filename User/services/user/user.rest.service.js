const _ = require("lodash");

module.exports = {
	name: "User.rest",

	version: 1,

	settings: {},

	dependencies: [],

	actions: {
		// Start define auth strategies

		default: {
			registry: {
				auth: {
					name: "Default",
					jwtKey: "secret",
				},
			},
			handler: require("./actionAuthStrategies/default.rest.action"),
		},

		// End define auth strategies

		register: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/User/Register",
				auth: {
					strategies: ["Default"],
					mode: "try",
				},
			},

			params: {
				body: {
					$$type: "object",
					fullName: "string",
					email: "string",
					phone: "string",
					password: "string",
					gender: "string",
				},
			},

			handler: require("./actions/register.rest.action"),
		},

		login: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/User/Login",
				auth: {
					strategies: ["Default"],
					mode: "try",
				},
			},

			params: {
				body: {
					$$type: "object",
					email: "string",
					password: "string",
				},
			},

			handler: require("./actions/login.rest.action"),
		},

		forgotPassword: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/User/ForgotPassword",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					email: "string",
				},
			},

			handler: require("./actions/forgotPassword.rest.action"),
		},

		resetPassword: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/User/ResetPassword",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {
				body: {
					$$type: "object",
					password: "string",
				},
			},

			handler: require("./actions/resetPassword.rest.action"),
		},

		logout: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/User/Logout",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {},

			handler: require("./actions/logout.rest.action"),
		},

		getUserInfo: {
			rest: {
				method: "GET",
				fullPath: "/v1/External/User/UserInfo",
				auth: {
					strategies: ["Default"],
					mode: "required",
				},
			},

			params: {},

			handler: require("./actions/getUserInfo.rest.action"),
		},
	},
};
