module.exports = async function (ctx) {
	try {
		return {
			payload: {
				message: "Rút tiền thành công!",
			},
		};
	} catch (err) {
		console.log(err);
	}
};
