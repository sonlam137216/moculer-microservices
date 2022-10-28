const gql = require("moleculer-apollo-server").moleculerGql;
module.exports = gql`
	type UserMutation {
		"Đăng nhập"
		Login(input: UserLoginInput!): UserLoginResponse
	}

	type UserQuery {
		"Lấy thông tin user"
		GetUserInfo(input: UserGetInfoInput!): UserGetInfoResponse
	}

	type UserLoginResponse {
		message: String
		succeeded: Boolean
		userInfo: UserInfo
		accessToken: String
	}
`;
