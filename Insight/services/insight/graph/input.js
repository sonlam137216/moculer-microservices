const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	input TransactionStatisticsByDayInput {
		fromDate: DateTime!
		toDate: DateTime!
		method: PaymentMethodEnum
		language: LanguageEnum
	}
	input TransactionStatisticsByAccountInput {
		fromDate: DateTime!
		toDate: DateTime!
		accountId: Int
		language: LanguageEnum
	}
`;
