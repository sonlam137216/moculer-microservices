const gql = require("moleculer-apollo-server").moleculerGql;
module.exports = gql`
	type UpdateWalletWithdrawSubscription {
		WithdrawUpdateWalletSubscription: UpdateWalletWithdrawSubscriptionResponse
	}
	type UpdateWalletDepositSubscription {
		DepositUpdateWalletSubscription: UpdateWalletDepositSubscriptionResponse
	}

	type UpdateWalletTransferSubscription {
		TransferUpdateWalletSubscription: UpdateWalletTransferSubscriptionResponse
	}

	type UpdateWalletSub {
		UpdateWalletSubscription: UpdateWalletSubscriptionResponse
	}

	type UpdateWalletSubscriptionResponse {
		payload: UpdateWalletPayloadInfo
	}

	type UpdateWalletWithdrawSubscriptionResponse {
		payload: UpdateWalletPayloadInfo
	}

	type UpdateWalletDepositSubscriptionResponse {
		payload: UpdateWalletPayloadInfo
	}

	type UpdateWalletTransferSubscriptionResponse {
		payload: UpdateWalletPayloadInfo
	}

	type UpdateWalletPayloadInfo {
		message: String
		type: UpdateWalletSubTypeEnum
	}
`;
