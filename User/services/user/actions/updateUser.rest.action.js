const _ = require("lodash");
const userI18nConstant = require("../constants/userI18n.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId } = ctx.meta.auth.credentials;
		const { fullName, gender } = ctx.params.body;

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
				code: 1001,
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
			code: 1000,
			message: this.__(userI18nConstant.USER_UPDATE_SUCCESS),
			data: {
				userInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
