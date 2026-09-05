import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateCreateBooking = (data) => {
    const {
        user,
        trip,

        type,
        item,
        itemModel,

        provider,
        externalItemId,

        bookingUrl,
        bookingMode,

        guestDetails,
        travelers,

        amount,
        currency,

        startDate,
        endDate,
    } = data;


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

    // Trip

    if (!trip) {
        throw new ApiError(
            400,
            "Trip ID is required."
        );
    }

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

    // Booking Type

    if (!type) {
        throw new ApiError(
            400,
            "Booking type is required."
        );
    }

    if (
        ![
            "Flight",
            "Hotel",
            "Restaurant",
            "Activity",
        ].includes(type)
    ) {
        throw new ApiError(
            400,
            "Invalid booking type."
        );
    }

    // Item

    if (!item) {
        throw new ApiError(
            400,
            "Booking item is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            item
        )
    ) {
        throw new ApiError(
            400,
            "Invalid booking item ID."
        );
    }

    // Item Model

    if (!itemModel) {
        throw new ApiError(
            400,
            "Item model is required."
        );
    }

    if (
        ![
            "FlightOffer",
            "Hotel",
            "Restaurant",
            "Activity",
        ].includes(itemModel)
    ) {
        throw new ApiError(
            400,
            "Invalid item model."
        );
    }

    // Type and Item Model must match

    const validTypeModelPairs = {
        Flight: "FlightOffer",
        Hotel: "Hotel",
        Restaurant: "Restaurant",
        Activity: "Activity",
    };

    if (
        validTypeModelPairs[type] !==
        itemModel
    ) {
        throw new ApiError(
            400,
            "Booking type and item model do not match."
        );
    }

    // Provider

    if (!provider?.trim()) {
        throw new ApiError(
            400,
            "Booking provider is required."
        );
    }

    // External Item ID

    if (
        externalItemId !== undefined &&
        typeof externalItemId !== "string"
    ) {
        throw new ApiError(
            400,
            "External item ID must be a string."
        );
    }

    // Booking Mode

    if (
        bookingMode &&
        ![
            "ExternalRedirect",
            "DirectAPI",
        ].includes(bookingMode)
    ) {
        throw new ApiError(
            400,
            "Invalid booking mode."
        );
    }

    // Booking URL

    if (
        bookingMode ===
            "ExternalRedirect" &&
        !bookingUrl?.trim()
    ) {
        throw new ApiError(
            400,
            "Booking URL is required for external redirect bookings."
        );
    }

    if (
        bookingUrl !== undefined &&
        typeof bookingUrl !== "string"
    ) {
        throw new ApiError(
            400,
            "Booking URL must be a string."
        );
    }

    // Guest Details

    if (guestDetails) {
        if (
            typeof guestDetails !==
            "object"
        ) {
            throw new ApiError(
                400,
                "Guest details must be an object."
            );
        }

        if (
            guestDetails.email &&
            typeof guestDetails.email !==
                "string"
        ) {
            throw new ApiError(
                400,
                "Guest email must be a string."
            );
        }
    }

    // Travelers

    if (travelers) {

        if (
            travelers.adults !==
                undefined &&
            travelers.adults < 1
        ) {
            throw new ApiError(
                400,
                "At least one adult is required."
            );
        }

        if (
            travelers.children !==
                undefined &&
            travelers.children < 0
        ) {
            throw new ApiError(
                400,
                "Children count cannot be negative."
            );
        }

        if (
            travelers.infants !==
                undefined &&
            travelers.infants < 0
        ) {
            throw new ApiError(
                400,
                "Infants count cannot be negative."
            );
        }
    }

    // Amount

    if (
        amount !== undefined &&
        amount < 0
    ) {
        throw new ApiError(
            400,
            "Amount cannot be negative."
        );
    }

    // Currency

    if (
        currency !== undefined &&
        typeof currency !== "string"
    ) {
        throw new ApiError(
            400,
            "Currency must be a string."
        );
    }

    // Dates

    if (
        startDate &&
        isNaN(
            new Date(startDate).getTime()
        )
    ) {
        throw new ApiError(
            400,
            "Invalid start date."
        );
    }

    if (
        endDate &&
        isNaN(
            new Date(endDate).getTime()
        )
    ) {
        throw new ApiError(
            400,
            "Invalid end date."
        );
    }

    if (
        startDate &&
        endDate &&
        new Date(startDate) >
            new Date(endDate)
    ) {
        throw new ApiError(
            400,
            "End date must be after start date."
        );
    }
};

// Update Booking Validation

const validateUpdateBooking = (data) => {

    if (
        !data ||
        !Object.keys(data).length
    ) {
        throw new ApiError(
            400,
            "No update data provided."
        );
    }

    // User

    if (
        data.user &&
        !mongoose.Types.ObjectId.isValid(
            data.user
        )
    ) {
        throw new ApiError(
            400,
            "Invalid user ID."
        );
    }

    // Trip

    if (
        data.trip &&
        !mongoose.Types.ObjectId.isValid(
            data.trip
        )
    ) {
        throw new ApiError(
            400,
            "Invalid trip ID."
        );
    }

    // Type

    if (
        data.type &&
        ![
            "Flight",
            "Hotel",
            "Restauurant",
            "Activity",
        ].includes(data.type)
    ) {
        throw new ApiError(
            400,
            "Invalid booking type."
        );
    }

    // Item

    if (
        data.item &&
        !mongoose.Types.ObjectId.isValid(
            data.item
        )
    ) {
        throw new ApiError(
            400,
            "Invalid booking item ID."
        );
    }

    // Item Model

    if (
        data.itemModel &&
        ![
            "FlightOffer",
            "Hotel",
            "Restaurant",
            "Activity",
        ].includes(
            data.itemModel
        )
    ) {
        throw new ApiError(
            400,
            "Invalid item model."
        );
    }

    // Type and Item Model

    const validTypeModelPairs = {
        Flight: "FlightOffer",
        Hotel: "Hotel",
        Restaurant: "Restaurant",
        Activity: "Activity",
    };

    if (
        data.type &&
        data.itemModel &&
        validTypeModelPairs[data.type] !==
            data.itemModel
    ) {
        throw new ApiError(
            400,
            "Booking type and item model do not match."
        );
    }

    // Provider

    if (
        data.provider !== undefined &&
        !data.provider?.trim()
    ) {
        throw new ApiError(
            400,
            "Provider cannot be empty."
        );
    }

    // Booking Mode

    if (
        data.bookingMode &&
        ![
            "ExternalRedirect",
            "DirectAPI",
        ].includes(
            data.bookingMode
        )
    ) {
        throw new ApiError(
            400,
            "Invalid booking mode."
        );
    }

    // Booking URL

    if (
        data.bookingUrl !== undefined &&
        typeof data.bookingUrl !==
            "string"
    ) {
        throw new ApiError(
            400,
            "Booking URL must be a string."
        );
    }

    // Amount

    if (
        data.amount !== undefined &&
        data.amount < 0
    ) {
        throw new ApiError(
            400,
            "Amount cannot be negative."
        );
    }

    // Travelers

    if (data.travelers) {

        if (
            data.travelers.adults !==
                undefined &&
            data.travelers.adults < 1
        ) {
            throw new ApiError(
                400,
                "At least one adult is required."
            );
        }

        if (
            data.travelers.children !==
                undefined &&
            data.travelers.children < 0
        ) {
            throw new ApiError(
                400,
                "Children count cannot be negative."
            );
        }

        if (
            data.travelers.infants !==
                undefined &&
            data.travelers.infants < 0
        ) {
            throw new ApiError(
                400,
                "Infants count cannot be negative."
            );
        }
    }

    if (
        data.startDate &&
        isNaN(
            new Date(
                data.startDate
            ).getTime()
        )
    ) {
        throw new ApiError(
            400,
            "Invalid start date."
        );
    }

    if (
        data.endDate &&
        isNaN(
            new Date(
                data.endDate
            ).getTime()
        )
    ) {
        throw new ApiError(
            400,
            "Invalid end date."
        );
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

    if (
        data.status &&
        ![
            "Selected",
            "BookingInitiated",
            "Redirected",
            "Unknown",
            "Confirmed",
            "Cancelled",
            "Failed",
        ].includes(
            data.status
        )
    ) {
        throw new ApiError(
            400,
            "Invalid booking status."
        );
    }
};

const validateCancelBooking = (
    cancellationReason
) => {
    if (
        !cancellationReason?.trim()
    ) {
        throw new ApiError(
            400,
            "Cancellation reason is required."
        );
    }
};

const validateBookingId = (
    bookingId
) => {

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
};

export {
    validateCreateBooking,
    validateUpdateBooking,
    validateCancelBooking,
    validateBookingId,
};