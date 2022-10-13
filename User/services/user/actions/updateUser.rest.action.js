const _ = require("lodash");
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
				data: {
					message: "Cập nhật user không thành công",
				},
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
			data: {
				message: "Cập nhật user thành công!",
				userInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
