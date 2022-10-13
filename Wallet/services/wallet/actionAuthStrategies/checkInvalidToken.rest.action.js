const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		return true;
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
