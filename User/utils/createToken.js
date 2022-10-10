const jwt = require("jsonwebtoken");

module.exports = function createToken(payload) {
	return jwt.sign(payload, process.env.JWT_SECRETKEY, {
		expiresIn: "1h",
	});
};
