const gql = require("moleculer-apollo-server").moleculerGql;
module.exports = gql`
	enum SessionStatusEnum {
		"Đang hoạt động"
		ACTIVE
		"Đã hết hạn"
		EXPIRED
	}

	enum UserGenderEnum {
		"Nam"
		MALE
		"Nữ"
		FEMALE
		"khác"
		OTHER
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
