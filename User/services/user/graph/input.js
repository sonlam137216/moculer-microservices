const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	input UserLoginInput {
		email: String!
		password: String!
		deviceId: String!
		language: LanguageEnum
	}

	input UserRegisterInput {
		fullName: String!
		email: String!
		phone: String!
		password: String!
		gender: UserGenderEnum!
		deviceId: String!
		language: LanguageEnum
	}

	input UserRegisterAdminInput {
		fullName: String!
		email: String!
		phone: String!
		password: String!
		gender: UserGenderEnum!
		deviceId: String!
		language: LanguageEnum
	}

	input UserGetInfoInput {
		language: LanguageEnum
	}
	input UserUpdateInfoInput {
		fullName: String!
		gender: UserGenderEnum!
		language: LanguageEnum
	}
	input UserForgotPasswordInput {
		email: String!
		language: LanguageEnum
	}
	input UserLogoutInput {
		language: LanguageEnum
	}
	input UserResetPasswordInput {
		email: String!
		password: String!
		otp: String!
		language: LanguageEnum
	}
	input UserLoginAdminInput {
		email: String!
		password: String!
		deviceId: String!
		language: LanguageEnum
	}
`;
