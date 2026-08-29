import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateFlightOfferId = (flightOfferId) => {
    if (!flightOfferId) {
        throw new ApiError(
            400,
            "Flight offer ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            flightOfferId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid flight offer ID."
        );
    }
};

const validateSelectFlightOffer = (data) => {
    const {
        flightOfferId,
        trip,
    } = data;

    if (!flightOfferId) {
        throw new ApiError(
            400,
            "Flight offer ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            flightOfferId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid flight offer ID."
        );
    }

    if (trip !== undefined) {
        if (
            !mongoose.Types.ObjectId.isValid(
                trip
            )
        ) {
            throw new ApiError(
                400,
                "Invalid trip ID."
            );
        }
    }
};

const validateBookingToken = (
    bookingToken
) => {
    if (!bookingToken) {
        throw new ApiError(
            400,
            "Booking token is required."
        );
    }

    if (
        typeof bookingToken !== "string" ||
        bookingToken.trim().length < 10
    ) {
        throw new ApiError(
            400,
            "Invalid booking token."
        );
    }
};

export {
    validateFlightOfferId,
    validateSelectFlightOffer,
    validateBookingToken,
};