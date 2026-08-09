import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { paymentService } from "../services/payment.services.js";

import {
    validateCreatePayment,
    validateUpdatePayment,
    validateRefundPayment,
    validatePaymentId,
} from "../validators/payment.validators.js";


const createPayment = asyncHandler(
    async (req, res) => {
        const paymentData = {
            ...req.body,
            user: req.user._id,
        };

        validateCreatePayment(
            paymentData
        );

        const payment =
            await paymentService.createPayment(
                paymentData
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                payment,
                "Payment created successfully."
            )
        );
    }
);

const getAllPayments = asyncHandler(
    async (req, res) => {
        const payments =
            await paymentService.getAllPayments({
                page: req.query.page,
                limit: req.query.limit,
                user: req.user._id,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                payments,
                "Payments fetched successfully."
            )
        );
    }
);

const getPaymentById = asyncHandler(
    async (req, res) => {
        const { paymentId } =
            req.params;

        validatePaymentId(
            paymentId
        );

        const payment =
            await paymentService.getPaymentById({
                paymentId,
                user: req.user._id,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                payment,
                "Payment fetched successfully."
            )
        );
    }
);

const searchPayments = asyncHandler(
    async (req, res) => {
        const payments =
            await paymentService.searchPayments(
                req.query.keyword,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                payments,
                "Search completed successfully."
            )
        );
    }
);

const filterPayments = asyncHandler(
    async (req, res) => {
        const payments =
            await paymentService.filterPayments({
                ...req.query,
                user: req.user._id,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                payments,
                "Payments filtered successfully."
            )
        );
    }
);

const updatePayment = asyncHandler(
    async (req, res) => {
        const { paymentId } =
            req.params;

        validatePaymentId(
            paymentId
        );

        validateUpdatePayment(
            req.body
        );

        const payment =
            await paymentService.updatePayment({
                paymentId,
                paymentData: req.body,
                user: req.user._id,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                payment,
                "Payment updated successfully."
            )
        );
    }
);

const markPaymentAsPaid =
    asyncHandler(
        async (req, res) => {
            const { paymentId } =
                req.params;

            validatePaymentId(
                paymentId
            );

            const payment =
                await paymentService.markPaymentAsPaid({
                    paymentId,
                    transactionId:
                        req.body.transactionId,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    payment,
                    "Payment marked as paid successfully."
                )
            );
        }
    );

const markPaymentAsFailed =
    asyncHandler(
        async (req, res) => {
            const { paymentId } =
                req.params;

            validatePaymentId(
                paymentId
            );

            const payment =
                await paymentService.markPaymentAsFailed({
                    paymentId,
                    failureReason:
                        req.body.failureReason,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    payment,
                    "Payment marked as failed successfully."
                )
            );
        }
    );

const refundPayment = asyncHandler(
    async (req, res) => {
        const { paymentId } =
            req.params;

        validatePaymentId(
            paymentId
        );

        validateRefundPayment(
            req.body
        );

        const payment =
            await paymentService.refundPayment({
                paymentId,
                refundAmount:
                    req.body.refundAmount,
                refundReason:
                    req.body.refundReason,
                user: req.user._id,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                payment,
                "Payment refunded successfully."
            )
        );
    }
);

const deletePayment = asyncHandler(
    async (req, res) => {
        const { paymentId } =
            req.params;

        validatePaymentId(
            paymentId
        );

        await paymentService.deletePayment({
            paymentId,
            user: req.user._id,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Payment deleted successfully."
            )
        );
    }
);

export {
    createPayment,
    getAllPayments,
    getPaymentById,
    searchPayments,
    filterPayments,
    updatePayment,
    markPaymentAsPaid,
    markPaymentAsFailed,
    refundPayment,
    deletePayment,
};