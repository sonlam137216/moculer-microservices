const _ = require("lodash");
const { nanoid } = require("nanoid");
const NodeRSA = require("node-rsa");
const CryptoJS = require("crypto-js");
const md5 = require("md5");

module.exports = async function (req, res, content) {
	if (!req.security) return content;
	const xAPIClient = req.headers["x-api-client"];
	const xAPIAction = req.headers["x-api-action"];
	const { rsaKey } = req.security;
	const encryptKey = nanoid();
	const key = new NodeRSA(rsaKey.publicKey);
	const xAPIKey = key.encrypt(encryptKey, "base64");
	const xApiMessage = CryptoJS.AES.encrypt(content, encryptKey).toString();
	const accessToken = _.get(req.headers, "authorization", "");
	const objValidate = {
		"x-api-action": xAPIAction,
		method: _.toUpper(req.method),
		accessToken,
		"x-api-message": xApiMessage,
	};
	const xAPIValidate = md5(_.values(objValidate).join("") + encryptKey);
	res.setHeader("x-api-key", xAPIKey);
	res.setHeader("x-api-client", xAPIClient);
	res.setHeader("x-api-action", xAPIAction);
	res.setHeader("x-api-validate", xAPIValidate);
	console.log("response");
	return JSON.stringify({
		"x-api-message": xApiMessage,
	});
};
