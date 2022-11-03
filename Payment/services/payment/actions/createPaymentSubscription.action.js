const _ = require("lodash");

module.exports = async function (ctx) {
	try {
		console.log("hello");
		return {
			payload: {
				message: "Bạn đã tạo đơn hàng thành công!",
			},
		};
	} catch (err) {
		console.log(err);
	}
};
