const gql = require("moleculer-apollo-server").moleculerGql;
module.exports = gql`
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
		data: [DataInfoByAccount]
	}

	type DataInfoByDay {
		date: String
		totalCount: Int
		totalCountOfSuccess: Int
	}
	type DataInfoByAccount {
		date: String
		totalCount: Int
		totalCountOfSuccess: Int
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
