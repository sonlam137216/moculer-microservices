const _ = require("lodash");

module.exports = async function (ctx) {
	try {
		const { type, accountId, paymentInfo } = ctx.params.payload;

		return {
			payload: {
				message: "Hủy đơn hàng!",
				accountId: accountId,
				paymentInfo,
				type,
			},
		};
	} catch (err) {
		console.log(err);
	}
};
