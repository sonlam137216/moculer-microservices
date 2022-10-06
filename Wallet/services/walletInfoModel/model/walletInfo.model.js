const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const _ = require("lodash");
const walletInfoConstant = require("../constants/walletInfo.constant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		balanceAvailable: {
			type: Number,
			required: true,
			min: [0, "The minimum of balanceAvailable is 0"],
			default: 0,
		},
		ownerId: {
			type: String,
			required: true,
		},
		paymentMethods: [
			{
				type: String,
				enum: _.values(walletInfoConstant.PAYMENT_METHOD),
				default: ["VISA"],
			},
		],
	},
	{
		collection: "Service_WalletInfo",
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
	mongoose.models.Service_WalletInfo ||
	mongoose.model(Schema.options.collection, Schema);
