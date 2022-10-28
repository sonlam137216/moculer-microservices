const _ = require("lodash");
const userI18nConstant = require("../constants/userI18n.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;
		const { language } = ctx.params.input;
		if (language === "en") this.setLocale(language);

		const userInfo = await this.broker.call("v1.UserInfoModel.findOne", [
			{ id: userId },
		]);

		if (!userInfo) {
			return {
				succeeded: false,
				message: this.__(userI18nConstant.USER_NOT_EXIST),
			};
		}

		const userInfoResponse = _.pick(userInfo, [
			"id",
			"fullName",
			"email",
			"phone",
			"gender",
		]);

		return {
			succeeded: true,
			message: this.__(userI18nConstant.GET_INFO_SUCCESS),
			userInfo: userInfoResponse,
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
