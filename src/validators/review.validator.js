import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

// Create Review Validation

const validateCreateReview = (data) => {
    const {
        user,
        reviewType,
        referenceId,
        rating,
        title,
        comment,
    } = data;

    // User

    if (!user) {
        throw new ApiError(
            400,
            "User ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            user
        )
    ) {
        throw new ApiError(
            400,
            "Invalid user ID."
        );
    }

    // Review Type

    const validReviewTypes = [
        "Trip",
        "Hotel",
        "Activity",
        "Restaurant",
    ];

    if (!reviewType) {
        throw new ApiError(
            400,
            "Review type is required."
        );
    }

    if (
        !validReviewTypes.includes(
            reviewType
        )
    ) {
        throw new ApiError(
            400,
            "Invalid review type."
        );
    }

    // Reference ID

    if (!referenceId) {
        throw new ApiError(
            400,
            "Reference ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            referenceId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid reference ID."
        );
    }

    // Rating

    if (rating === undefined || rating === null) {
        throw new ApiError(
            400,
            "Rating is required."
        );
    }

    if (
        typeof rating !== "number" ||
        rating < 1 ||
        rating > 5
    ) {
        throw new ApiError(
            400,
            "Rating must be a number between 1 and 5."
        );
    }

    // Title

    if (
        title !== undefined &&
        title !== null &&
        typeof title !== "string"
    ) {
        throw new ApiError(
            400,
            "Review title must be a string."
        );
    }

    // Comment

    if (
        comment !== undefined &&
        comment !== null &&
        typeof comment !== "string"
    ) {
        throw new ApiError(
            400,
            "Review comment must be a string."
        );
    }
};

// Update Review Validation

const validateUpdateReview = (
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

    // Review Type

    const validReviewTypes = [
        "Trip",
        "Hotel",
        "Activity",
        "Restaurant",
    ];

    if (
        data.reviewType &&
        !validReviewTypes.includes(
            data.reviewType
        )
    ) {
        throw new ApiError(
            400,
            "Invalid review type."
        );
    }

    // Reference ID

    if (
        data.referenceId &&
        !mongoose.Types.ObjectId.isValid(
            data.referenceId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid reference ID."
        );
    }

    // Rating

    if (
        data.rating !== undefined &&
        (
            typeof data.rating !== "number" ||
            data.rating < 1 ||
            data.rating > 5
        )
    ) {
        throw new ApiError(
            400,
            "Rating must be a number between 1 and 5."
        );
    }

    // Title

    if (
        data.title !== undefined &&
        data.title !== null &&
        typeof data.title !== "string"
    ) {
        throw new ApiError(
            400,
            "Review title must be a string."
        );
    }

    // Comment

    if (
        data.comment !== undefined &&
        data.comment !== null &&
        typeof data.comment !== "string"
    ) {
        throw new ApiError(
            400,
            "Review comment must be a string."
        );
    }
};

// Review ID Validation

const validateReviewId = (
    reviewId
) => {
    if (!reviewId) {
        throw new ApiError(
            400,
            "Review ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            reviewId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid review ID."
        );
    }
};

export {
    validateCreateReview,
    validateUpdateReview,
    validateReviewId,
};