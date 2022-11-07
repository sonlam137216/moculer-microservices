const gql = require("moleculer-apollo-server").moleculerGql;
module.exports = gql`
	enum PaymentMethodEnum {
		"ví"
		WALLET
		"ngân hàng"
		BANK
		"napas"
		NAPAS
	}

	enum PaymentStatusEnum {
		"chưa thanh toán"
		UNPAID
		"bị quá hạn"
		EXPIRED
		"đã thanh toán"
		PAID
		"đang xử lý"
		PROCESSING
		"thất bại"
		FAILED
	}
	enum PaymentSubTypeEnum {
		"xác nhận thanh toán"
		VERIFY_PAYMENT
		"hủy thanh toán"
		CANCEL_PAYMENT
		"tạo thanh toán"
		CREATE_PAYMENT
	}
`;
