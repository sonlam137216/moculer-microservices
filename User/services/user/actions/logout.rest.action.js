const _ = require("lodash");
const MoleculerError = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const accessToken = ctx.meta.token;
		const user = ctx.meta.user;

		await this.broker.call("v1.UserInfoModel.findOneAndUpdate", [
			{
				id: user.id,
			},
			{
				$push: { expiredTokens: accessToken },
			},
		]);
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
