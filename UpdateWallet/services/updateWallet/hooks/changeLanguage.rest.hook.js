const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		let language;
		language = ctx.params.body?.language;
		if (!language) language = ctx.params.query;

		console.log("language", language);

		if (language === "en") this.setLocale(language);
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError")
			throw new MoleculerError(err.message, err.code);
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
