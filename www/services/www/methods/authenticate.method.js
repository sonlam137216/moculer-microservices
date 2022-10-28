const _ = require("lodash");
const awaitAsyncForeach = require("await-async-foreach");
const jsonWebToken = require("jsonwebtoken");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx, route, req, authHandler) {
	// if (req.url === "/api/list-aliases")
	// 	return { credentials: null, isValid: false };
	// console.log("=====================");
	// console.log("CTX", ctx);
	// console.log("=====================");
	// // console.log("ROUTE", route);
	// console.log("=====================");
	// console.log("REQ", req);
	// console.log("=====================");
	// console.log("AUTH HANDLER", authHandler);
	// console.log("=====================");

	let authConf = {
		strategies: ["Default"],
		mode: "required", // 'required', 'optional', 'try'
	};
	if (_.has(req, "$action.rest.auth")) {
		authConf = req.$action.rest.auth;
	}
	if (_.has(route, "opts.auth")) {
		authConf = route.opts.auth;
	}
	if (authConf === false) {
		return { credentials: null, isValid: false };
	}

	if (!_.isArray(authConf.strategies)) {
		throw new MoleculerError(
			"Invalid auth strategies",
			500,
			null,
			authConf.strategies
		);
	}

	let flagStop = false;
	let decoded;
	let action;

	await awaitAsyncForeach(authConf.strategies, (strategy) => {
		if (flagStop === true) return false;
		const handler = _.get(authHandler, strategy, {});
		const { jwtKey } = handler;
		action = handler.action;

		try {
			decoded = jsonWebToken.verify(req.headers.authorization, jwtKey);
		} catch (error) {
			decoded = {};
		}
		if (decoded) {
			flagStop = true;
			return true;
		}
	});
	let isValid = false;
	switch (authConf.mode) {
		case "required":
			if (_.isEmpty(decoded)) {
				throw new MoleculerError(
					"Thông tin xác thực không hợp lệ",
					401,
					null,
					null
				);
			}
			isValid = true;
			break;

		case "optional":
			if (_.isEmpty(decoded) && _.has(req, "headers.authorization")) {
				throw new MoleculerError(
					"Thông tin xác thực không hợp lệ",
					401,
					null,
					null
				);
			}
			if (!_.isEmpty(decoded)) {
				isValid = true;
			}
			break;
		case "try":
			if (!_.isEmpty(decoded) && _.has(req, "headers.authorization")) {
				isValid = true;
			}
			break;
		default:
			break;
	}
	let data;
	try {
		if (isValid === true) {
			data = await ctx.broker.call(action, decoded);
			console.log("data", data);
		}
	} catch (error) {
		console.log(error);
		throw new MoleculerError(error.message, 401, null, error.data);
	}
	return {
		credentials: { ...decoded, token: req.headers.authorization },
		isValid,
		data,
	};
};
