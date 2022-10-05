const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		ctx.meta.user = ctx.params;
		return true;
	} catch (error) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
