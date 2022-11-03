const _ = require("lodash");

module.exports = async function (ctx) {
	try {
		console.log(ctx.params);
		return {
			payload: {
				message: "Đơn hàng của bạn đã bị hủy!",
			},
		};
	} catch (err) {
		console.log(err);
	}
};
