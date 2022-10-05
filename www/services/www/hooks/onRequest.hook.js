const _ = require('lodash');
const NodeRSA = require('node-rsa');
const CryptoJS = require('crypto-js');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (req, res, securityURI) {
	const ctx = req.$ctx;
	// Fix nếu xài url có params nếu cần thiết _.find(_.keys(arr), o => _.startsWith(o, '/domain2'))
	if (process.env.SECURITY === 'false' || securityURI[req.url] === false) return false;
	if (process.env.SECURITY_BYPASS) {
		if (req.headers.security === process.env.SECURITY_BYPASS) {
			return false;
		}
	}
	const xAPIKey = req.headers['x-api-key'];
	const xAPIClient = req.headers['x-api-client'];
	const xAPIAction = req.headers['x-api-action'];

	if (!xAPIClient || !xAPIAction || !xAPIKey) {
		throw new MoleculerError('Thông tin mã hóa không chính xác (-1)', 400, null, null);
	}
	const rsaKey = await ctx.broker.call('security.pick', {
		xAPIClient
	});

	if (!rsaKey) {
		throw new MoleculerError('Thông tin mã hóa không chính xác (-2)', 400, null, null);
	}

	let encryptKey;
	try {
		const key = new NodeRSA(rsaKey.privateKey);
		encryptKey = key.decrypt(xAPIKey, 'utf8');
		if (!encryptKey) {
			throw new MoleculerError('Thông tin mã hóa không chính xác (-3)', 400, null, null);
		}
	} catch (error) {
		throw new MoleculerError('Thông tin mã hóa không chính xác (-4)', 400, null, null);
	}

	let uri = null;
	try {
		uri = CryptoJS.AES.decrypt(xAPIAction, encryptKey).toString(CryptoJS.enc.Utf8);
	} catch (error) {
		throw new MoleculerError('Thông tin mã hóa không chính xác (-5)', 400, null, null);
	}
	req.url = uri;
	req.security = {
		rsaKey,
		encryptKey
	};
};
