const _ = require("lodash");
const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const walletHistoryConstant = require("../constants/walletHistory.constant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		userId: {
			type: Number,
			required: true,
		},
		walletId: {
			type: Number,
			required: true,
		},
		balanceBefore: {
			type: Number,
			required: true,
		},
		balanceAfter: {
			type: Number,
			required: true,
		},
		transferType: {
			type: String,
			required: true,
			enum: _.values(walletHistoryConstant.WALLET_ACTION_TYPE),
		},
		transactionId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: _.values(walletHistoryConstant.WALLET_HISTORY_STATUS),
			default: walletHistoryConstant.WALLET_HISTORY_STATUS.PENDING,
		},
	},
	{
		collection: "Service_WalletHistory",
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
	mongoose.models.Service_WalletHistory ||
	mongoose.model(Schema.options.collection, Schema);
