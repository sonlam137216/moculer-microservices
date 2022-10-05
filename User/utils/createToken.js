const jwt = require("jsonwebtoken");

module.exports = function createToken(payload) {
	return jwt.sign(payload, "secret", {
		expiresIn: "1h",
	});
};
