const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	input PaymentCreateInput {
        totalPrice: Int
        description: String
        note: String
        paymentMethod
	}

`;
