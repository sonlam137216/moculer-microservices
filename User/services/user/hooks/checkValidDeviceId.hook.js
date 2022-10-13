const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { userId, deviceId } = ctx.meta.auth.credentials;

		// check user deviceID
		const existingUser = await this.broker.call(
			"v1.UserInfoModel.findOne",
			[{ id: userId }]
		);

		if (_.get(existingUser, "id", null) === null) {
			throw new MoleculerError("Không tồn tại User", 401);
		}

		if (!existingUser.deviceIds.includes(deviceId)) {
			console.log("LOG");
			throw new MoleculerError("Device không trùng khớp", 401);
		}
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError")
			throw new MoleculerError(err.message, err.code);
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
