const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const otpConstant = require("../constants/otp.constant");
const _ = require("lodash");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
		otp: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: _.values(otpConstant.OTP_STATUS),
		},
		time: {
			type: Date,
			default: Date.now,
			index: { expires: 60 },
		},
	},
	{
		collection: "Service_OTP",
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

module.exports =
	mongoose.models.Service_OTP ||
	mongoose.model(Schema.options.collection, Schema);
