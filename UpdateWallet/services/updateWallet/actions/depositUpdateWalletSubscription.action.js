module.exports = async function (ctx) {
	try {
		return {
			payload: {
				message: "Nạp tiền thành công!",
			},
		};
	} catch (err) {
		console.log(err);
	}
};
