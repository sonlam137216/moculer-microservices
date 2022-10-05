const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const _ = require("lodash");
const userInfoConstant = require("../constants/userInfoConstant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		id: {
			type: Number,
			required: true,
			unique: true,
		},
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
		expiredTokens: [
			{
				type: String,
				default: [],
			},
		],
	},
	{
		collection: "Service_UserInfo",
		versionKey: false,
		timestamps: true,
	}
);

// plugins

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1,
});

module.exports = mongoose.model(Schema.options.collection, Schema);
