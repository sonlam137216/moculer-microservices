module.exports = function validatePhoneNumber(phoneNumber) {
	const re = /((84)+([0-9]{9})\b)/g;
	return re.test(phoneNumber);
};
