const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const _ = require("lodash");
const paymentConstant = require("../constants/payment.constant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		userId: {
			type: Number,
			required: true,
		},
		totalPrice: {
			type: Number,
			required: true,
			default: 0,
		},
		description: {
			type: String,
			default: "",
		},
		note: {
			type: String,
			default: "",
		},
		paymentMethod: {
			type: String,
			enum: _.values(paymentConstant.PAYMENT_METHOD),
			default: "WALLET",
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: _.values(paymentConstant.PAYMENT_STATUS),
			default: "UNPAID",
		},
		supplierResponse: {
			responseStatus: {
				type: Boolean,
				required: true,
				default: false,
			},
			transaction: {
				transactionId: {
					type: Number,
				},
				description: {
					type: String,
					default: "",
				},
			},
		},
		supplierTransaction: {
			transactionId: {
				type: Number,
			},
			description: {
				type: String,
				default: "",
			},
		},
	},
	{
		collection: "Service_PaymentInfo",
		versionKey: false,
		timestamps: true,
	}
);

// indexes
Schema.index({ id: 1 }, { unique: true, sparse: false });
Schema.index({ userId: 1 }, { unique: false, sparse: false });

// plugins

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1,
});

module.exports =
	mongoose.models.Service_PaymentInfo ||
	mongoose.model(Schema.options.collection, Schema);
