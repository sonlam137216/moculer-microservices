const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const _ = require("lodash");
const userSessionConstant = require("../constants/userSession.constant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		userId: {
			type: Number,
			required: true,
			default: null,
		},
		expiredAt: {
			type: Date,
			required: true,
			default: null,
		},
		deviceId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: _.values(userSessionConstant.SESSION_STATUS),
			required: true,
			default: userSessionConstant.SESSION_STATUS.ACTIVE,
		},
	},
	{
		collection: "Service_UserSession",
		versionKey: false,
		timestamps: true,
	}
);

// indexes
Schema.index({ id: 1 }, { unique: 1, sparse: false });
Schema.index({ userId: 1 }, { unique: false, sparse: false });

// plugins
Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1,
});

module.exports =
	mongoose.models.Service_UserSession ||
	mongoose.model(Schema.options.collection, Schema);
