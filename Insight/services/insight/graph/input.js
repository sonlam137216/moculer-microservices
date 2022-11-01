const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	input TransactionStatisticsByDayInput {
		fromDate: String
		toDate: String
		method: PaymentMethodEnum
		language: LanguageEnum
	}
	input TransactionStatisticsByAccountInput {
		fromDate: String
		toDate: String
		method: PaymentMethodEnum
		language: LanguageEnum
	}
`;
