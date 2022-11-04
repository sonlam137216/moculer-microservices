const gql = require("moleculer-apollo-server").moleculerGql;
module.exports = gql`
	type PaymentMutation {
		"Tạo đơn thanh toán"
		CreatePayment(input: PaymentCreateInput!): PaymentCreateResponse
	}

	type PaymentQuery {
		"Lấy thông tin thanh toán theo ID"
		GetPaymentById(input: PaymentGetByIdInput!): PaymentGetByIdResponse
	}

	type PaymentSubscription {
		PaymentSub: PaymentSubscriptionResponse
	}

	type PaymentSubscriptionResponse {
		payload: PayloadInfo
	}

	type PaymentCreateSubscription {
		"Subscription event"
		CreatePaymentSubscription: PaymentCreateSubscriptionResponse
	}

	type PaymentCancelSubscription {
		"Subscription event"
		CancelPaymentSubscription: PaymentCancelSubscriptionResponse
	}
	type PaymentVerifyByNapasSubscription {
		VerifyByNapasPaymentSubscription: PaymentVerifyByNapasSubscriptionResponse
	}

	type PaymentCreateSubscriptionResponse {
		payload: PayloadInfo
	}

	type PaymentCancelSubscriptionResponse {
		payload: PayloadInfo
	}

	type PaymentVerifyByNapasSubscriptionResponse {
		payload: PayloadInfo
	}

	type PayloadInfo {
		message: String
		type: PaymentSubTypeEnum
	}

	type PayloadCreateInfo {
		message: String
	}
	type PayloadCancelInfo {
		message: String
	}

	type PaymentCreateResponse {
		message: String
		succeeded: Boolean
		paymentInfo: PaymentInfo
		url: String
	}

	type PaymentGetByIdResponse {
		message: String
		succeeded: Boolean
		paymentInfo: PaymentInfo
	}

	type PaymentInfo {
		supplierResponse: PaymentSupplierResponse
		totalPrice: Int
		description: String
		note: String
		status: PaymentStatusEnum
		paymentMethod: PaymentMethodEnum
		id: Int
		userInfo: UserInfo
	}

	type PaymentSupplierResponse {
		transaction: SupplierResponseTransaction
		responseStatus: Boolean
	}
	type SupplierResponseTransaction {
		description: String
		transactionId: String
	}
`;
