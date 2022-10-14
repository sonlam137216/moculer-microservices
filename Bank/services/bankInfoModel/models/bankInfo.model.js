const _ = require("lodash");
const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const bankInfoModelConstant = require("../constants/bankInfoModel.constant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		transactionId: {
			type: String,
			required: true,
		},

		transactionAmount: {
			type: Number,
			required: true,
		},
		otp: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: bankInfoModelConstant.TRANSACTION_STATUS.PENDING,
			enum: _.values(bankInfoModelConstant.TRANSACTION_STATUS),
		},
	},
	{
		collection: "Service_Bank",
		versionKey: false,
		timestamps: true,
	}
);

// indexes
Schema.index({ id: 1 }, { unique: true, sparse: false });

// plugins
Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1,
});

module.exports =
	mongoose.models.Service_Bank ||
	mongoose.model(Schema.options.collection, Schema);
