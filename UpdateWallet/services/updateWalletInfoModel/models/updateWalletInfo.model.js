const _ = require("lodash");
const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const updateWalletInfoModelConstant = require("../constants/updateWalletInfoModel.constant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		transactionInfo: {
			transactionId: {
				type: String,
			},
			transactionAmount: {
				type: Number,
			},
			status: {
				type: String,
				enum: _.values(
					updateWalletInfoModelConstant.TRANSACTION_STATUS
				),
			},
			transferType: {
				type: String,
				required: true,
				enum: _.values(
					updateWalletInfoModelConstant.WALLET_ACTION_TYPE
				),
			},
		},
		transactionInfoFromSupplier: {
			transactionId: {
				type: String,
			},
			transactionAmount: {
				type: Number,
			},
			status: {
				type: String,
				enum: _.values(
					updateWalletInfoModelConstant.TRANSACTION_STATUS
				),
			},
		},
	},
	{
		collection: "Service_UpdateWalletInfo",
		versionKey: false,
		timestamps: true,
	}
);

// indexes
Schema.index({ id: 1 }, { unique: true, sparse: false });
Schema.index({ ownerId: 1 }, { unique: false, sparse: false });

// plugins
Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1,
});

module.exports =
	mongoose.models.Service_UpdateWalletInfo ||
	mongoose.model(Schema.options.collection, Schema);
