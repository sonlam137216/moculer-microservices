const _ = require("lodash");
const bankConstant = require("../constants/bank.constant");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { otp, transactionId } = ctx.params.body;

		const transactionInfo = await this.broker.call(
			"v1.BankInfoModel.findOne",
			[
				{
					transactionId,
					status: bankConstant.TRANSACTION_STATUS.PENDING,
					otp,
				},
			]
		);

		if (_.get(transactionInfo, "id", null) === null) {
			return {
				code: 1001,
				success: false,
				data: {
					message:
						"Không tìm thấy thông tin thanh toán từ ngân hàng!",
				},
			};
		}

		const updatedTransaction = await this.broker.call(
			"v1.BankInfoModel.findOneAndUpdate",
			[
				{
					id: transactionInfo.id,
					transactionId,
					status: bankConstant.TRANSACTION_STATUS.PENDING,
				},
				{
					status: bankConstant.TRANSACTION_STATUS.SUCCEEDED,
				},
			]
		);

		if (_.get(updatedTransaction, "id", null) === null) {
			await this.broker.call("v1.BankInfoModel.findOneAndUpdate", [
				{
					id: transactionInfo.id,
					transactionId,
					status: bankConstant.TRANSACTION_STATUS.PENDING,
				},
				{
					status: bankConstant.TRANSACTION_STATUS.FAILED,
				},
			]);

			return {
				code: 1001,
				success: false,
				data: {
					transactionInfo,
					message: "Cập nhật từ ngân hàng không thành công!",
				},
			};
		}

		return {
			code: 1000,
			success: true,
			data: {
				transactionInfo,
				message: "Thanh toán từ ngân hàng thành công!",
			},
		};
	} catch (error) {
		console.log("ERR", error);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Create Order: ${err.message}`);
	}
};
