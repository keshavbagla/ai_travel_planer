 import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateCreateHotel = (data) => {
    const {
        name,
        destination,
        address,
        city,
        country,
        location,
        starRating,
        pricePerNight,
    } = data;

    if (!name?.trim()) {
        throw new ApiError(400, "Hotel name is required.");
    }

    if (!destination) {
        throw new ApiError(400, "Destination ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(destination)) {
        throw new ApiError(400, "Invalid destination ID.");
    }

    if (!address?.trim()) {
        throw new ApiError(400, "Address is required.");
    }

    if (!city?.trim()) {
        throw new ApiError(400, "City is required.");
    }

    if (!country?.trim()) {
        throw new ApiError(400, "Country is required.");
    }

    if (
        !location ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
    ) {
        throw new ApiError(400, "Valid hotel coordinates are required.");
    }

    if (!starRating) {
        throw new ApiError(400, "Star rating is required.");
    }

    if (starRating < 1 || starRating > 5) {
        throw new ApiError(400, "Star rating must be between 1 and 5.");
    }

    if (pricePerNight < 0) {
        throw new ApiError(400, "Price per night cannot be negative.");
    }

};

const validateUpdateHotel = (data) => {
    if (!Object.keys(data).length) {
        throw new ApiError(400, "No update data provided.");
    }

};

const validateHotelId = (hotelId) => {
    if (!hotelId) {
        throw new ApiError(400, "Hotel ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new ApiError(400, "Invalid hotel ID.");
    }

};

export {
    validateCreateHotel,
    validateUpdateHotel,
    validateHotelId,
};