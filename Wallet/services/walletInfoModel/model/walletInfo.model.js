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
			type: Number,
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

// indexes
Schema.index({ id: 1 }, { unique: true, sparse: true });
Schema.index({ ownerId: 1 }, { unique: false, sparse: false });

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
