const jwt = require("jsonwebtoken");

module.exports = function verifyToken(token) {
	return jwt.verify(token, "secret");
};
