module.exports = function generateOtp() {
	const num = Math.floor(Math.random() * (999999 - 100000) + 100000);
	return num.toString();
};
