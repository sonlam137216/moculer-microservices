module.exports = async function (ctx) {
	try {
		console.log("payload create");
		return {
			message: "Payload Create Return",
		};
	} catch (err) {
		console.log(err);
	}
};
