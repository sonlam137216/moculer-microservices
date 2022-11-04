module.exports = async function (ctx) {
	try {
		return {
			message: "Verify payment by Napas",
		};
	} catch (err) {
		console.log(err);
	}
};
