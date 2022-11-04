module.exports = async function (ctx) {
	try {
		return {
			payload: {
				message: "Chuyển tiền thành công",
			},
		};
	} catch (err) {
		console.log(err);
	}
};
