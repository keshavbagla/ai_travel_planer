import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateCreateActivity = (data) => {
    const {
        name,
        destination,
        city,
        country,
        category,
        location,
        price,
    } = data;

    if (!name?.trim()) {
        throw new ApiError(
            400,
            "Activity name is required."
        );
    }

    if (!destination) {
        throw new ApiError(
            400,
            "Destination ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            destination
        )
    ) {
        throw new ApiError(
            400,
            "Invalid destination ID."
        );
    }

    if (!city?.trim()) {
        throw new ApiError(
            400,
            "City is required."
        );
    }

    if (!country?.trim()) {
        throw new ApiError(
            400,
            "Country is required."
        );
    }

    if (!category?.trim()) {
        throw new ApiError(
            400,
            "Activity category is required."
        );
    }

    if (
        !location ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
    ) {
        throw new ApiError(
            400,
            "Valid activity coordinates are required."
        );
    }

    if (
        price !== undefined &&
        Number(price) < 0
    ) {
        throw new ApiError(
            400,
            "Price cannot be negative."
        );
    }

};

const validateUpdateActivity = (data) => {
    if (!Object.keys(data).length) {
        throw new ApiError(
            400,
            "No update data provided."
        );
    }
};

const validateActivityId = (
    activityId
) => {
    if (!activityId) {
        throw new ApiError(
            400,
            "Activity ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            activityId
        )
    ) {

        throw new ApiError(
            400,
            "Invalid activity ID."
        );
    }
};

export {
    validateCreateActivity,
    validateUpdateActivity,
    validateActivityId,
};