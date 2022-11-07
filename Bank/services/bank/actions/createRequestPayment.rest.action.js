const _ = require("lodash");
const generateOTP = require("../../../utils/generateOTP");
const generateTransactionId = require("../../../utils/generateTransactionId");
const bankConstant = require("../constants/bank.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { phone, transactionAmount } = ctx.params;

		const otp = generateOTP();
		const transactionId = generateTransactionId();

		const transactionInfo = await this.broker.call(
			"v1.BankInfoModel.create",
			[
				{
					transactionId,
					transactionAmount,
					otp,
					status: bankConstant.TRANSACTION_STATUS.PENDING,
				},
			]
		);

		if (_.get(transactionInfo, "id", null) === null) {
			return {
				code: 1001,
				success: false,
				data: {
					message: "Tạo thông tin thanh toán không thành công!",
				},
			};
		}

		return {
			code: 1000,
			success: true,
			data: {
				message: "Bank trả thông tin!",
				user: { phone, otp },
				transactionInfo,
			},
		};
	} catch (err) {
		console.log("ERR", err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
