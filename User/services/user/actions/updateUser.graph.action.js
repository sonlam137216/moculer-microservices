const _ = require("lodash");
const userI18nConstant = require("../constants/userI18n.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;
		const { fullName, gender, language } = ctx.params.input;

		if (language === "en") this.setLocale(language);

		const updatedUser = await this.broker.call(
			"v1.UserInfoModel.findOneAndUpdate",
			[
				{
					id: userId,
				},
				{
					fullName,
					gender,
				},
				{
					new: true,
				},
			]
		);

		if (_.get(updatedUser, "id", null) === null) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.ERROR_USER_UPDATE),
			};
		}

		const userInfo = _.pick(updatedUser, [
			"id",
			"fullName",
			"email",
			"phone",
			"gender",
		]);

		return {
			succeeded: true,
			message: this.__(userI18nConstant.USER_UPDATE_SUCCESS),
			userInfo,
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
