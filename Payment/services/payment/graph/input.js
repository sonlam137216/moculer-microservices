const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	input PaymentCreateInput {
		totalPrice: Int!
		description: String
		note: String
		paymentMethod: PaymentMethodEnum!
		accountId: Int!
		language: LanguageEnum
	}

	input PaymentGetByIdInput {
		id: Int!
		language: LanguageEnum
	}

	input PaymentSubscriptionInput {
		accountId: Int!
	}
`;
