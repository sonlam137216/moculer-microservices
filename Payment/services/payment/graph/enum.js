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
        "bị quá hạn"
        "đã thanh toán"
        "đang xử lý"
        "thất bại"
	}
	enum UserRoleEnum {
		"admin"
		ADMIN
		"customer"
		CUSTOMER
	}
	enum LanguageEnum {
		"English"
		en
		"Vietnamese"
		vi
	}
`;
