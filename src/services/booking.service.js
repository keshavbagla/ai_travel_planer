import { Booking } from "../models/booking.model.js";
import { User } from "../models/user.model.js";
import { Trip } from "../models/trip.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Activity } from "../models/activity.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateBookingReference } from "../utils/generateBookingReference.js";

const populateBooking = (query) => {
    return query
        .populate(
            "user",
            "fullName email avatar"
        )
        .populate(
            "trip",
            "tripName slug startDate endDate status travelers"
        )
        .populate(
            "hotel",
            "name starRating pricePerNight coverImage"
        )
        .populate(
            "activities",
            "name category price coverImage"
        );
};

const validateReferences = async (
    bookingData
) => {

    const user =
        await User.findById(
            bookingData.user
        );

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    const trip =
        await Trip.findById(
            bookingData.trip
        );

    if (!trip) {
        throw new ApiError(
            404,
            "Trip not found."
        );
    }

    if (bookingData.hotel) {
        const hotel =
            await Hotel.findById(
                bookingData.hotel
            );

        if (!hotel) {
            throw new ApiError(
                404,
                "Hotel not found."
            );
        }
    }

    if (
        Array.isArray(
            bookingData.activities
        )
    ) {
        const count =
            await Activity.countDocuments({
                _id: {
                    $in: bookingData.activities,
                },
            });

        if (
            count !==
            bookingData.activities.length
        ) {
            throw new ApiError(
                404,
                "One or more activities not found."
            );
        }
    }
};

const createPassengerSnapshots = async ({
    travelerIds,
    user,
}) => {
    if (
        !travelerIds ||
        travelerIds.length === 0
    ) {
        return [];
    }

    const uniqueTravelerIds = [
        ...new Set(
            travelerIds.map(
                (id) => String(id)
            )
        ),
    ];

    const travelers =
        await Traveler.find({
            _id: {
                $in: uniqueTravelerIds,
            },
            user,
            isActive: true,
        });

    if (
        travelers.length !==
        uniqueTravelerIds.length
    ) {
        throw new ApiError(
            404,
            "One or more travelers were not found."
        );
    }

    return travelers.map(
        (traveler) => ({
            traveler:
                traveler._id,

            firstName:
                traveler.firstName,

            lastName:
                traveler.lastName,

            dateOfBirth:
                traveler.dateOfBirth,

            gender:
                traveler.gender,

            nationality:
                traveler.nationality,

            email:
                traveler.email,

            phone:
                traveler.phone,

            travelerType:
                traveler.travelerType,

            passport:
                traveler.passport
                    ? {
                        passportNumber:
                            traveler
                                .passport
                                .passportNumber,

                        issueDate:
                            traveler
                                .passport
                                .issueDate,

                        expiryDate:
                            traveler
                                .passport
                                .expiryDate,

                        issuingCountry:
                            traveler
                                .passport
                                .issuingCountry,
                    }
                    : null,
        })
    );
};

const createBooking = async (
    bookingData
) => {

    await validateReferences(
        bookingData
    );

    let bookingReference;
    do {
        bookingReference = generateBookingReference();
    } 
    while (
        await Booking.exists({
            bookingReference,
        })
    );

    const booking = await Booking.create({
        ...bookingData,
        bookingReference,
    });

    const populatedBooking = await populateBooking(
        Booking.findById(booking._id)
    );

    console.log("Booking Guests:", populatedBooking.guests);
    console.log("Booking:", populatedBooking);

    return populatedBooking;
};

const getAllBookings = async ({
    page = 1,
    limit = 10,
    user,
} = {}) => {
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const [
        bookings,
        total,
    ] = await Promise.all([
        populateBooking(
            Booking.find({
                user,
                isActive: true,
            })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
        ),

        Booking.countDocuments({
            user,
            isActive: true,
        }),
    ]);

    return {
        bookings,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};

const getBookingById = async ({
    bookingId,
    user,
}) => {
    const booking =
        await populateBooking(
            Booking.findOne({
                _id: bookingId,
                user,
                isActive: true,
            })
        );

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    return booking;
};

const searchBookings = async (
    keyword,
    user
) => {
    if (!keyword) {
        return [];
    }

    return await populateBooking(
        Booking.find({
            user,
            isActive: true,
            $or: [
                {
                    bookingReference: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    bookingType: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
            ],
        })
            .sort({
                createdAt: -1,
            })
            .limit(20)
    );
};

const filterBookings = async ({
    user,
    bookingStatus,
    paymentStatus,
    bookingType,
    isCancelled,
} = {}) => {
    const query = {
        user,
        isActive: true,
    };

    if (bookingStatus) {
        query.bookingStatus =
            bookingStatus;
    }

    if (paymentStatus) {
        query.paymentStatus =
            paymentStatus;
    }

    if (bookingType) {
        query.bookingType =
            bookingType;
    }

    if (
        isCancelled !==
        undefined
    ) {
        query.isCancelled =
            isCancelled;
    }

    return await populateBooking(
        Booking.find(query).sort({
            createdAt: -1,
        })
    );
};

const updateBooking = async ({
    bookingId,
    bookingData,
    user
}) => {
    const booking =
        await Booking.findOne({
            _id: bookingId,
            user,
            isActive: true,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    // Validate References

    if (
        bookingData.trip ||
        bookingData.hotel ||
        bookingData.activities
    ) {
        await validateReferences({
            user: booking.user,
            trip: bookingData.trip || booking.trip,
            hotel: bookingData.hotel || booking.hotel,
            activities: bookingData.activities || booking.activities,
        });
    }

    Object.entries(
        bookingData
    ).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null
        ) {
            booking[key] = value;
        }

    });

    await booking.save();

    return await populateBooking(
        Booking.findById(
            booking._id
        )
    );
};

const cancelBooking = async ({
    bookingId,
    user,
    cancellationReason
}) => {
    const booking =
        await Booking.findOne({
            _id: bookingId,
            user,
            isActive: true,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    booking.bookingStatus =
        "Cancelled";

    booking.isCancelled = true;

    booking.cancellationReason =
        cancellationReason;

    booking.cancellationDate =
        new Date();

    await booking.save();

    return await populateBooking(
        Booking.findById(
            booking._id
        )
    );
};

// Delete Booking

const deleteBooking = async ({
    bookingId,
    user
}) => {
    const booking =
        await Booking.findOne({
            _id: bookingId,
            user,
            isActive: true,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    booking.isActive = false;

    await booking.save();
};

export const bookingService = {
    createBooking,
    getAllBookings,
    getBookingById,
    searchBookings,
    filterBookings,
    updateBooking,
    cancelBooking,
    deleteBooking,
};