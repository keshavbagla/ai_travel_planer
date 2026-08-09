import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateCreateTrip = (data) => {
    const {
        tripName,
        user,
        destination,
        startDate,
        endDate,
    } = data;

    if (!tripName?.trim()) {
        throw new ApiError(
            400,
            "Trip name is required."
        );
    }

    if (!user) {
        throw new ApiError(
            400,
            "User ID is required."
        );
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
        throw new ApiError(
            400,
            "Invalid user ID."
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

    if (!startDate) {
        throw new ApiError(
            400,
            "Start date is required."
        );
    }

    if (!endDate) {
        throw new ApiError(
            400,
            "End date is required."
        );
    }

    if (
        new Date(startDate) >=
        new Date(endDate)
    ) {
        throw new ApiError(
            400,
            "End date must be after start date."
        );
    }
};

const validateUpdateTrip = (
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
        data.destination &&
        !mongoose.Types.ObjectId.isValid(
            data.destination
        )
    ) {
        throw new ApiError(
            400,
            "Invalid destination ID."
        );
    }

    if (
        data.hotel &&
        !mongoose.Types.ObjectId.isValid(
            data.hotel
        )
    ) {
        throw new ApiError(
            400,
            "Invalid hotel ID."
        );
    }

    if (data.restaurants) {
        if (!Array.isArray(data.restaurants)) {
            throw new ApiError(
                400,
                "Restaurants must be an array."
            );
        }

        data.restaurants.forEach((id) => {
            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                throw new ApiError(
                    400,
                    "Invalid restaurant ID."
                );
            }
        });
    }

    if (data.activities) {
        if (!Array.isArray(data.activities)) {
            throw new ApiError(
                400,
                "Activities must be an array."
            );
        }

        data.activities.forEach((id) => {
            if ( !mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(
                    400,
                    "Invalid activity ID."
                );
            }
        });
    }

    if (
        data.startDate &&
        data.endDate &&
        new Date(data.startDate) >
        new Date(data.endDate)
    ) {
        throw new ApiError(
            400,
            "End date must be after start date."
        );
    }
};

const validateTripId = (
    tripId
) => {
    if (!tripId) {
        throw new ApiError(
            400,
            "Trip ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            tripId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid trip ID."
        );
    }
};

export {
    validateCreateTrip,
    validateUpdateTrip,
    validateTripId,
};