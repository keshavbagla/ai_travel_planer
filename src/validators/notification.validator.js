import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

// Create Notification Validation

const validateCreateNotification = (data) => {
    const {
        user,
        type,
        title,
        message,
        referenceId,
        referenceModel,
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

    // Type

    const validTypes = [
        "Booking",
        "Payment",
        "Trip",
        "System",
        "Promotion",
    ];

    if (!type) {
        throw new ApiError(
            400,
            "Notification type is required."
        );
    }

    if (!validTypes.includes(type)) {
        throw new ApiError(
            400,
            "Invalid notification type."
        );
    }

    // Title

    if (!title?.trim()) {
        throw new ApiError(
            400,
            "Notification title is required."
        );
    }

    // Message

    if (!message?.trim()) {
        throw new ApiError(
            400,
            "Notification message is required."
        );
    }

    // Reference ID

    if (referenceId) {
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
    }

    // Reference Model

    const validReferenceModels = [
        "Booking",
        "Payment",
        "Trip",
    ];

    if (
        referenceModel &&
        !validReferenceModels.includes(
            referenceModel
        )
    ) {
        throw new ApiError(
            400,
            "Invalid reference model."
        );
    }

    // Reference consistency

    if (
        referenceId &&
        !referenceModel
    ) {
        throw new ApiError(
            400,
            "Reference model is required when reference ID is provided."
        );
    }

    if (
        referenceModel &&
        !referenceId
    ) {
        throw new ApiError(
            400,
            "Reference ID is required when reference model is provided."
        );
    }
};

// Update Notification Validation

const validateUpdateNotification = (
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

    // Type

    const validTypes = [
        "Booking",
        "Payment",
        "Trip",
        "System",
        "Promotion",
    ];

    if (
        data.type &&
        !validTypes.includes(
            data.type
        )
    ) {
        throw new ApiError(
            400,
            "Invalid notification type."
        );
    }

    // Title

    if (
        data.title !== undefined &&
        !data.title?.trim()
    ) {
        throw new ApiError(
            400,
            "Notification title cannot be empty."
        );
    }

    // Message

    if (
        data.message !== undefined &&
        !data.message?.trim()
    ) {
        throw new ApiError(
            400,
            "Notification message cannot be empty."
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

    // Reference Model

    const validReferenceModels = [
        "Booking",
        "Payment",
        "Trip",
    ];

    if (
        data.referenceModel &&
        !validReferenceModels.includes(
            data.referenceModel
        )
    ) {
        throw new ApiError(
            400,
            "Invalid reference model."
        );
    }

    // Read Status

    if (
        data.isRead !== undefined &&
        typeof data.isRead !== "boolean"
    ) {
        throw new ApiError(
            400,
            "isRead must be a boolean."
        );
    }

    // Read Date

    if (
        data.readAt !== undefined &&
        data.readAt !== null &&
        isNaN(
            new Date(data.readAt).getTime()
        )
    ) {
        throw new ApiError(
            400,
            "Invalid read date."
        );
    }
};

// Mark As Read Validation

const validateMarkAsRead = (
    notificationId
) => {
    if (!notificationId) {
        throw new ApiError(
            400,
            "Notification ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            notificationId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid notification ID."
        );
    }
};


const validateNotificationId = (
    notificationId
) => {
    if (!notificationId) {
        throw new ApiError(
            400,
            "Notification ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            notificationId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid notification ID."
        );
    }
};

export {
    validateCreateNotification,
    validateUpdateNotification,
    validateMarkAsRead,
    validateNotificationId,
};