const gql = require("moleculer-apollo-server").moleculerGql;
module.exports = gql`
	enum UpdateWalletSubTypeEnum {
		"cộng tiền"
		DEPOSIT
		"rút tiền"
		WITHDRAW
		"chuyển tiền"
		TRANSFER
	}
	enum UpdateWalletTransactionStatusEnum {
		"Đang xử lý"
		PENDING
		"thành công"
		SUCCEEDED
		"thất bại"
		FAILED
	}
	enum UpdateWalletActionTypeEnum {
		"Cộng tiền"
		ADD
		"Trừ tiền"
		SUB
		"Chuyển tiền"
		TRANSFER
		"thanh toán hóa đơn"
		PAYMENT
	}
`;
