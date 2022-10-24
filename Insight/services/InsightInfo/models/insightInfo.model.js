const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{},
	{
		collection: "Service_InsightInfo",
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
