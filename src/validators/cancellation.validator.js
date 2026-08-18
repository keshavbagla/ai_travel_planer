import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateCreateCancellation = (
    data
) => {
    const {
        bookingId,
        reason,
    } = data;

    if (!bookingId) {
        throw new ApiError(
            400,
            "Booking ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            bookingId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid booking ID."
        );
    }

    if (!reason) {
        throw new ApiError(
            400,
            "Cancellation reason is required."
        );
    }

    if (
        typeof reason !== "string"
    ) {
        throw new ApiError(
            400,
            "Cancellation reason must be a string."
        );
    }

    if (
        reason.trim().length < 3
    ) {
        throw new ApiError(
            400,
            "Cancellation reason must contain at least 3 characters."
        );
    }

    if (
        reason.trim().length > 500
    ) {
        throw new ApiError(
            400,
            "Cancellation reason cannot exceed 500 characters."
        );
    }
};

const validateUpdateCancellation = (
    data
) => {
    if (
        !Object.keys(data).length
    ) {
        throw new ApiError(
            400,
            "No update data provided."
        );
    }

    if (
        data.cancellationStatus !==
        undefined
    ) {
        const validStatuses = [
            "Requested",
            "Approved",
            "Rejected",
            "Completed",
        ];

        if (
            !validStatuses.includes(
                data.cancellationStatus
            )
        ) {
            throw new ApiError(
                400,
                "Invalid cancellation status."
            );
        }
    }

    if (
        data.refundStatus !==
        undefined
    ) {
        const validRefundStatuses = [
            "NotApplicable",
            "Pending",
            "Processing",
            "Completed",
            "Failed",
        ];

        if (
            !validRefundStatuses.includes(
                data.refundStatus
            )
        ) {
            throw new ApiError(
                400,
                "Invalid refund status."
            );
        }
    }

    if (
        data.refundAmount !==
        undefined
    ) {
        if (
            typeof data.refundAmount !==
                "number" ||
            data.refundAmount < 0
        ) {
            throw new ApiError(
                400,
                "Refund amount must be a non-negative number."
            );
        }
    }

    if (
        data.reason !== undefined
    ) {
        if (
            typeof data.reason !==
                "string"
        ) {
            throw new ApiError(
                400,
                "Cancellation reason must be a string."
            );
        }

        if (
            data.reason.trim().length <
            3
        ) {
            throw new ApiError(
                400,
                "Cancellation reason must contain at least 3 characters."
            );
        }

        if (
            data.reason.trim().length >
            500
        ) {
            throw new ApiError(
                400,
                "Cancellation reason cannot exceed 500 characters."
            );
        }
    }

    if (
        data.notes !== undefined &&
        data.notes !== null &&
        typeof data.notes !== "string"
    ) {
        throw new ApiError(
            400,
            "Cancellation notes must be a string."
        );
    }
};

// Cancellation ID Validation

const validateCancellationId = (
    cancellationId
) => {
    if (!cancellationId) {
        throw new ApiError(
            400,
            "Cancellation ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            cancellationId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid cancellation ID."
        );
    }
};

export {
    validateCreateCancellation,
    validateUpdateCancellation,
    validateCancellationId,
};