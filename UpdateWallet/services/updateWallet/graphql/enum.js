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
`;
