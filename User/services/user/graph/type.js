const gql = require("moleculer-apollo-server").moleculerGql;
module.exports = gql`
	type UserMutation {
		"Đăng nhập"
		Login(input: UserLoginInput!): UserLoginResponse

		"Đăng nhập quản trị viên"
		LoginAdmin(input: UserLoginAdminInput!): UserLoginAdminResponse

		"Cập nhật thông tin người dùng"
		UpdateUser(input: UserUpdateInfoInput!): UserUpdateInfoResponse

		"Đăng ký người dùng"
		Register(input: UserRegisterInput!): UserRegisterResponse

		"Đăng ký người dùng quản trị viên"
		RegisterAdmin(input: UserRegisterAdminInput!): UserRegisterAdminResponse

		"Quên mật khẩu"
		ForgotPassword(
			input: UserForgotPasswordInput!
		): UserForgotPasswordResponse

		"Đăng xuất"
		Logout(input: UserLogoutInput): UserLogoutResponse

		"Reset mật khẩu"
		ResetPassword(input: UserResetPasswordInput!): UserResetPasswordResponse
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

	type UserLoginAdminResponse {
		message: String
		succeeded: Boolean
		userInfo: UserInfo
		accessToken: String
	}

	type UserInfo {
		id: Int
		fullName: String
		email: String
		phone: String
		gender: UserGenderEnum
	}
	type UserGetInfoResponse {
		message: String
		succeeded: Boolean
		userInfo: UserInfo
	}
	type UserUpdateInfoResponse {
		message: String
		succeeded: Boolean
		userInfo: UserInfo
	}

	type UserRegisterResponse {
		message: String
		succeeded: Boolean
		accessToken: String
		userInfo: UserInfo
	}

	type UserRegisterAdminResponse {
		message: String
		succeeded: Boolean
		accessToken: String
		userInfo: UserInfo
	}

	type UserForgotPasswordResponse {
		succeeded: Boolean
		message: String
		otp: String
	}

	type UserLogoutResponse {
		succeeded: Boolean
		message: String
	}

	type UserResetPasswordResponse {
		succeeded: Boolean
		message: String
	}
`;
