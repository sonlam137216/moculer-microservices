module.exports = async function (ctx) {
	try {
		return {
			payload: {
				message: "Bạn xác nhận đơn hàng thành công!",
			},
		};
	} catch (err) {
		console.log(err);
	}
};
