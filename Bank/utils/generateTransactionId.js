module.exports = function generateTransactionId() {
	const num = Math.floor(Math.random() * (99999999 - 10000000) + 10000000);
	return num.toString();
};
