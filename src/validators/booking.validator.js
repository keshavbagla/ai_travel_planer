import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateCreateBooking = (
    data
) => {
    const {
        user,
        trip,
        hotel,
        activities,
        bookingType,
        checkInDate,
        checkOutDate,
        guests,
        totalAmount,
        paymentMethod,
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

    if (
        hotel &&
        !mongoose.Types.ObjectId.isValid(
            hotel
        )
    ) {
        throw new ApiError(
            400,
            "Invalid hotel ID."
        );
    }

    if (activities) {
        if (
            !Array.isArray(
                activities
            )
        ) {
            throw new ApiError(
                400,
                "Activities must be an array."
            );
        }

        activities.forEach(
            (id) => {
                if (
                    !mongoose.Types.ObjectId.isValid(
                        id
                    )
                ) {
                    throw new ApiError(
                        400,
                        "Invalid activity ID."
                    );
                }
            }
        );
    }

    if (
        bookingType &&
        ![
            "Trip",
            "Hotel",
            "Activity",
        ].includes(
            bookingType
        )
    ) {
        throw new ApiError(
            400,
            "Invalid booking type."
        );
    }

    if (!checkInDate) {
        throw new ApiError(
            400,
            "Check-in date is required."
        );
    }

    if (!checkOutDate) {
        throw new ApiError(
            400,
            "Check-out date is required."
        );
    }

    if (
        new Date(
            checkInDate
        ) >
        new Date(
            checkOutDate
        )
    ) {
        throw new ApiError(
            400,
            "Check-out date must be after check-in date."
        );
    }

    if (!guests) {
        throw new ApiError(
            400,
            "Guest details are required."
        );
    }

    if (
        guests.adults ===
            undefined ||
        guests.adults < 1
    ) {
        throw new ApiError(
            400,
            "At least one adult is required."
        );
    }

    if (
        guests.children &&
        guests.children < 0
    ) {
        throw new ApiError(
            400,
            "Children count cannot be negative."
        );
    }

    if (
        guests.infants &&
        guests.infants < 0
    ) {
        throw new ApiError(
            400,
            "Infants count cannot be negative."
        );
    }

    if (
        totalAmount ===
        undefined
    ) {
        throw new ApiError(
            400,
            "Total amount is required."
        );
    }

    if (totalAmount < 0) {
        throw new ApiError(
            400,
            "Total amount cannot be negative."
        );
    }

    if (
        paymentMethod &&
        ![
            "Card",
            "UPI",
            "Net Banking",
            "Wallet",
            "Cash",
        ].includes(
            paymentMethod
        )
    ) {
        throw new ApiError(
            400,
            "Invalid payment method."
        );
    }
};

const validateUpdateBooking = (
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

    if (
        data.activities
    ) {
        if (
            !Array.isArray(
                data.activities
            )
        ) {
            throw new ApiError(
                400,
                "Activities must be an array."
            );
        }

        data.activities.forEach(
            (id) => {
                if (
                    !mongoose.Types.ObjectId.isValid(
                        id
                    )
                ) {
                    throw new ApiError(
                        400,
                        "Invalid activity ID."
                    );
                }
            }
        );
    }

    if (
        data.bookingType &&
        ![
            "Trip",
            "Hotel",
            "Activity",
        ].includes(
            data.bookingType
        )
    ) {
        throw new ApiError(
            400,
            "Invalid booking type."
        );
    }

    if (
        data.paymentMethod &&
        ![
            "Card",
            "UPI",
            "Net Banking",
            "Wallet",
            "Cash",
        ].includes(
            data.paymentMethod
        )
    ) {
        throw new ApiError(
            400,
            "Invalid payment method."
        );
    }

    if (
        data.paymentStatus &&
        ![
            "Pending",
            "Paid",
            "Refunded",
            "Failed",
        ].includes(
            data.paymentStatus
        )
    ) {
        throw new ApiError(
            400,
            "Invalid payment status."
        );
    }

    if (
        data.bookingStatus &&
        ![
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled",
        ].includes(
            data.bookingStatus
        )
    ) {
        throw new ApiError(
            400,
            "Invalid booking status."
        );
    }

    if (
        data.checkInDate &&
        data.checkOutDate &&
        new Date(
            data.checkInDate
        ) >
            new Date(
                data.checkOutDate
            )
    ) {
        throw new ApiError(
            400,
            "Check-out date must be after check-in date."
        );
    }

    if (
        data.totalAmount !==
            undefined &&
        data.totalAmount < 0
    ) {
        throw new ApiError(
            400,
            "Total amount cannot be negative."
        );
    }

    if (
        data.guests
    ) {
        if (
            data.guests.adults !==
                undefined &&
            data.guests.adults < 1
        ) {
            throw new ApiError(
                400,
                "At least one adult is required."
            );
        }

        if (
            data.guests.children &&
            data.guests.children < 0
        ) {
            throw new ApiError(
                400,
                "Children count cannot be negative."
            );
        }

        if (
            data.guests.infants &&
            data.guests.infants < 0
        ) {
            throw new ApiError(
                400,
                "Infants count cannot be negative."
            );
        }
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