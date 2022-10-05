const _ = require('lodash');
const md5 = require('md5');
const { MoleculerError } = require('moleculer').Errors;
const CryptoJS = require('crypto-js');

module.exports = function (req, res) {
	if (!req.security) return false;
	const ctx = req.$ctx;
	const xAPIKey = req.headers['x-api-key'];
	const xAPIClient = req.headers['x-api-client'];
	const xAPIAction = req.headers['x-api-action'];
	const xAPIValidate = req.headers['x-api-validate'];
	const xAPIMessage = _.get(req.body, 'x-api-message', '');
	const authorization = _.get(req.headers, 'authorization', '');
	const { rsaKey, encryptKey } = req.security;
	const objValidate = {
		'x-api-action': xAPIAction,
		method: _.toUpper(req.method),
		authorization,
		'x-api-message': xAPIMessage
	};
	const validate = md5(_.values(objValidate).join('') + encryptKey);
	if (validate !== xAPIValidate) {
		throw new MoleculerError('Thông tin mã hóa không chính xác (-7)', 400, null, null);
	}

	let body = null;
	try {
		if (xAPIMessage !== '') {
			body = JSON.parse(CryptoJS.AES.decrypt(xAPIMessage, encryptKey).toString(CryptoJS.enc.Utf8));
		}
	} catch (error) {
		throw new MoleculerError('Thông tin mã hóa không chính xác (-8)', 400, null, null);
	}

	req.body = body;

	return true;
};
