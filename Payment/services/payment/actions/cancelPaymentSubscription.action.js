const _ = require("lodash");

module.exports = async function (ctx) {
	try {
		console.log(ctx.params);
		return {
			payloadCancel: {
				message: "Đơn hàng của bạn đã bị hủy!",
			},
		};
	} catch (err) {
		console.log(err);
	}
};
