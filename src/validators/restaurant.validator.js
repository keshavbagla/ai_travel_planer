import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateCreateRestaurant = (data) => {
    const {
        name,
        destination,
        address,
        city,
        country,
        location,
        averageCostForTwo,
    } = data;

    if (!name?.trim()) {
        throw new ApiError(
            400,
            "Restaurant name is required."
        );
    }

    if (!destination) {
        throw new ApiError(
            400,
            "Destination ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(destination)
    ) {
        throw new ApiError(
            400,
            "Invalid destination ID."
        );
    }

    if (!address?.trim()) {
        throw new ApiError(
            400,
            "Address is required."
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

    if (
        !location ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
    ) {
        throw new ApiError(
            400,
            "Valid restaurant coordinates are required."
        );
    }

    if (
        averageCostForTwo === undefined ||
        averageCostForTwo === null
    ) {
        throw new ApiError(
            400,
            "Average cost for two is required."
        );
    }

    if (averageCostForTwo < 0) {
        throw new ApiError(
            400,
            "Average cost for two cannot be negative."
        );
    }

};

const validateUpdateRestaurant = (data) => {
    if (!Object.keys(data).length) {
        throw new ApiError(
            400,
            "No update data provided."
        );
    }
};

const validateRestaurantId = (
    restaurantId
) => {
    if (!restaurantId) {
        throw new ApiError(
            400,
            "Restaurant ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            restaurantId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid restaurant ID."
        );
    }
};

export {
    validateCreateRestaurant,
    validateUpdateRestaurant,
    validateRestaurantId,
};