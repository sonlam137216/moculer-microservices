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

	type UpdateWalletWithdrawSubscriptionResponse {
		payload: PayloadInfo
	}

	type UpdateWalletDepositSubscriptionResponse {
		payload: PayloadInfo
	}

	type UpdateWalletTransferSubscriptionResponse {
		payload: PayloadInfo
	}
`;
