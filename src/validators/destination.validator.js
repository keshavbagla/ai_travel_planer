import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateCreateDestination = (data) => {
    const {
        name,
        city,
        country,
        location,
    } = data;

    if (!name?.trim()) {
        throw new ApiError(400, "Destination name is required.");
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
        throw new ApiError(400, "Valid destination coordinates are required.");
    }
};

const validateUpdateDestination = (data) => {
    if (!Object.keys(data).length) {
        throw new ApiError(400, "No update data provided.");
    }
};

const validateDestinationId = (destinationId) => {
  if (!destinationId) {
    throw new ApiError(400, "Destination ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(destinationId)) {
    throw new ApiError(400, "Invalid destination ID.");
  }
};

export {
    validateCreateDestination,
    validateUpdateDestination,
    validateDestinationId,
};