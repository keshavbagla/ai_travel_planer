import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

// Valid Wishlist Item Types

const validItemTypes = [
    "Trip",
    "Hotel",
    "Activity",
    "Restaurant",
];

// Create Wishlist Validation

const validateCreateWishlist = (data) => {
    const {
        user,
        itemType,
        itemId,
        notes,
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

    // Item Type

    if (!itemType) {
        throw new ApiError(
            400,
            "Item type is required."
        );
    }

    if (
        !validItemTypes.includes(
            itemType
        )
    ) {
        throw new ApiError(
            400,
            "Invalid wishlist item type."
        );
    }

    // Item ID

    if (!itemId) {
        throw new ApiError(
            400,
            "Item ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            itemId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid item ID."
        );
    }

    // Notes

    if (
        notes !== undefined &&
        notes !== null &&
        typeof notes !== "string"
    ) {
        throw new ApiError(
            400,
            "Wishlist notes must be a string."
        );
    }
};

// Update Wishlist Validation

const validateUpdateWishlist = (
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

    // Item Type

    if (
        data.itemType &&
        !validItemTypes.includes(
            data.itemType
        )
    ) {
        throw new ApiError(
            400,
            "Invalid wishlist item type."
        );
    }

    // Item ID

    if (
        data.itemId &&
        !mongoose.Types.ObjectId.isValid(
            data.itemId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid item ID."
        );
    }

    // Notes

    if (
        data.notes !== undefined &&
        data.notes !== null &&
        typeof data.notes !== "string"
    ) {
        throw new ApiError(
            400,
            "Wishlist notes must be a string."
        );
    }
};

// Wishlist ID Validation

const validateWishlistId = (
    wishlistId
) => {
    if (!wishlistId) {
        throw new ApiError(
            400,
            "Wishlist ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            wishlistId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid wishlist ID."
        );
    }
};

export {
    validateCreateWishlist,
    validateUpdateWishlist,
    validateWishlistId,
};