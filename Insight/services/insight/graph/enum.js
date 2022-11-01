const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	enum testEnum {
		ACTIVE
		INACTIVE
	}
`;
