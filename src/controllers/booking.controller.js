import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { bookingService } from "../services/booking.service.js";
import {
    validateCreateBooking,
    validateUpdateBooking,
    validateCancelBooking,
    validateBookingId,
} from "../validators/booking.validator.js";

const createBooking = asyncHandler(async (req, res) => {
    const bookingData = {
        ...req.body,
        user: req.user._id,
    };

    validateCreateBooking(
        bookingData
    );

    const booking =
        await bookingService.createBooking(
            bookingData
        );

    return res.status(201).json(
        new ApiResponse(
            201,
            booking,
            "Booking created successfully."
        )
    );
});

const getAllBookings = asyncHandler(async (req, res) => {
    const bookings =
        await bookingService.getAllBookings({
            page: req.query.page,
            limit: req.query.limit,
            user: req.user._id,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            bookings,
            "Bookings fetched successfully."
        )
    );
});

const getBookingById = asyncHandler(async (req, res) => {
    const { bookingId } =
        req.params;

    validateBookingId(
        bookingId
    );

    const booking =
        await bookingService.getBookingById({
            bookingId,
            user: req.user._id,
    });    

    return res.status(200).json(
        new ApiResponse(
            200,
            booking,
            "Booking fetched successfully."
        )
    );
});

const searchBookings = asyncHandler(async (req, res) => {
    const bookings =
        await bookingService.searchBookings(
            req.query.keyword,
            req.user._id
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            bookings,
            "Search completed successfully."
        )
    );
});

const filterBookings = asyncHandler(async (req, res) => {
    const bookings =
        await bookingService.filterBookings({
            ...req.query,
            user: req.user._id,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            bookings,
            "Bookings filtered successfully."
        )
    );
});

const updateBooking = asyncHandler(async (req, res) => {
    const { bookingId } =
        req.params;

    validateBookingId(
        bookingId
    );

    validateUpdateBooking(
        req.body
    );

    const booking =
        await bookingService.updateBooking({
            bookingId,
            user: req.user._id,
            bookingData:
                req.body,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            booking,
            "Booking updated successfully."
        )
    );
});

const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } =
        req.params;

    validateBookingId(
        bookingId
    );

    validateCancelBooking(
        req.body.cancellationReason
    );

    const booking =
        await bookingService.cancelBooking({
            bookingId,
            user: req.user._id,
            cancellationReason:
                req.body
                    .cancellationReason,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            booking,
            "Booking cancelled successfully."
        )
    );
});

const deleteBooking = asyncHandler(async (req, res) => {
    const { bookingId } =
        req.params;

    validateBookingId(
        bookingId
    );

    await bookingService.deleteBooking({
        bookingId,
        user: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Booking deleted successfully."
        )
    );
});

export {
    createBooking,
    getAllBookings,
    getBookingById,
    searchBookings,
    filterBookings,
    updateBooking,
    cancelBooking,
    deleteBooking,
};