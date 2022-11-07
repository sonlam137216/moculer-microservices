const _ = require("lodash");

module.exports = async function (ctx) {
	try {
		const { type, accountId, transactionInfo } = ctx.params.payload;

		return {
			payload: {
				message: "Nạp tiền thành công!",
				accountId: accountId,
				type,
				transactionInfo,
			},
		};
	} catch (err) {
		console.log(err);
	}
};
