const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		let language;
		language = ctx.params.input?.language;
		if (language && language === "en") this.setLocale(language);
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError")
			throw new MoleculerError(err.message, err.code);
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
