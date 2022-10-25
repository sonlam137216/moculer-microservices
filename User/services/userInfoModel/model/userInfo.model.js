const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const _ = require("lodash");
const userInfoConstant = require("../constants/userInfoConstant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		gender: {
			type: String,
			enum: _.values(userInfoConstant.GENDER),
		},
		role: {
			type: String,
			required: true,
			enum: _.values(userInfoConstant.ROLE),
			default: userInfoConstant.ROLE.CUSTOMER,
		},
		deviceIds: [
			{
				type: String,
				required: true,
			},
		],
	},
	{
		collection: "Service_UserInfo",
		versionKey: false,
		timestamps: true,
	}
);

// indexes
Schema.index({ email: 1 }, { unique: true, sparse: false });
Schema.index({ phone: 1 }, { unique: true, sparse: false });
Schema.index({ id: 1 }, { unique: true, sparse: false });

// plugins

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1,
});

module.exports =
	mongoose.models.Service_UserInfo ||
	mongoose.model(Schema.options.collection, Schema);
