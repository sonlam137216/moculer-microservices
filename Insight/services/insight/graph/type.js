const gql = require("moleculer-apollo-server").moleculerGql;
const { GraphQLDateTime } = require("graphql-iso-date");
module.exports = gql`
	scalar DateTime
	type InsightMutation {
		Hello: String
	}

	type InsightQuery {
		"Thống kê giao dịch theo ngày"
		GetTransactionStatisticsByDay(
			input: TransactionStatisticsByDayInput!
		): TransactionStatisticsByDayResponse

		"Xuất file excel giao dịch theo ngày"
		ExportToExcelTransactionStatisticsByDay(
			input: TransactionStatisticsByDayInput!
		): InsightExportToExcelByDayResponse

		"Thống kê giao dịch theo tài khoản"
		GetTransactionStatisticsByAccount(
			input: TransactionStatisticsByAccountInput!
		): TransactionStatisticsByAccountResponse

		"Xuất file excel giao dịch theo tài khoản"
		ExportToExcelTransactionStatisticsByAccount(
			input: TransactionStatisticsByAccountInput!
		): InsightExportToExcelByAccountResponse
	}

	type TransactionStatisticsByDayResponse {
		message: String
		succeeded: Boolean
		data: [DataInfoByDay]
	}

	type TransactionStatisticsByAccountResponse {
		message: String
		succeeded: Boolean
		data: DataInfoByAccount
	}

	type DataInfoByDay {
		date: DateTime
		totalCount: Int
		totalCountOfSuccess: Int
	}
	type DataInfoByAccount {
		totalTransaction: Int
		totalTransactionSuccess: Int
		accountsAndPayments: [DataAccountDetail]
	}

	type DataAccountDetail {
		fullName: String
		id: Int
		email: String
		totalTransaction: Int
		totalTransactionSuccess: Int
	}

	type InsightExportToExcelByDayResponse {
		message: String
		succeeded: Boolean
		path: String
	}
	type InsightExportToExcelByAccountResponse {
		message: String
		succeeded: Boolean
		path: String
	}
`;
