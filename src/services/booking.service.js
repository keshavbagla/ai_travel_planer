import { Booking } from "../models/booking.model.js";
import { User } from "../models/user.model.js";
import { Trip } from "../models/trip.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Activity } from "../models/activity.model.js";
import { Traveler } from "../models/traveler.model.js";
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
            "item"
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

    if (
        !bookingData.item
    ) {
        throw new ApiError(
            400,
            "Booking item is required."
        );
    }

    if (
        bookingData.itemModel ===
        "Hotel"
    ) {
        const hotel =
            await Hotel.findById(
                bookingData.item
            );

        if (!hotel) {
            throw new ApiError(
                404,
                "Hotel not found."
            );
        }
    }

    if (
        bookingData.itemModel ===
        "Activity"
    ) {
        const activity =
            await Activity.findById(
                bookingData.item
            );

        if (!activity) {
            throw new ApiError(
                404,
                "Activity not found."
            );
        }
    }

    if (
        bookingData.itemModel ===
        "Flight"
    ) {

        if (
            !trip.selectedFlight
        ) {
            throw new ApiError(
                404,
                "Selected flight not found in trip."
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
                            traveler.passport
                                .passportNumber,

                        issueDate:
                            traveler.passport
                                .issueDate,

                        expiryDate:
                            traveler.passport
                                .expiryDate,

                        issuingCountry:
                            traveler.passport
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

    const passengers =
        await createPassengerSnapshots({
            travelerIds:
                bookingData.travelerIds,
            user:
                bookingData.user,
        });

    let bookingReference;

    do {
        bookingReference =
            generateBookingReference();

    } while (
        await Booking.exists({
            bookingReference,
        })
    );

    const {
        travelerIds,
        ...bookingFields
    } = bookingData;


    const booking =
        await Booking.create({
            ...bookingFields,

            metadata: {
                ...(bookingFields.metadata || {}),

                passengerSnapshots:
                    passengers,
            },

            status:
                bookingFields.status ||
                "Selected",
        });

    return await populateBooking(
        Booking.findById(
            booking._id
        )
    );
};

const getAllBookings = async ({
    page = 1,
    limit = 10,
    user,
} = {}) => {
    page = Number(page);
    limit = Number(limit);

    const skip =
        (page - 1) * limit;

    const [
        bookings,
        total,
    ] = await Promise.all([

        populateBooking(
            Booking.find({
                user,
            })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
        ),

        Booking.countDocuments({
            user,
        }),
    ]);

    return {
        bookings,

        pagination: {
            page,
            limit,
            total,

            totalPages:
                Math.ceil(
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

            $or: [
                {
                    provider: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

                {
                    type: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

                {
                    status: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

                {
                    externalItemId: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

                {
                    providerBookingId: {
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
    status,
    type,
    provider,
    bookingMode,
} = {}) => {
    const query = {
        user,
    };

    if (status) {
        query.status = status;
    }

    if (type) {
        query.type = type;
    }

    if (provider) {
        query.provider = provider;
    }

    if (bookingMode) {
        query.bookingMode =
            bookingMode;
    }

    return await populateBooking(
        Booking.find(query)
            .sort({
                createdAt: -1,
            })
    );
};

const updateBooking = async ({
    bookingId,
    bookingData,
    user,
}) => {
    const booking =
        await Booking.findOne({
            _id: bookingId,
            user,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    if (
        bookingData.trip ||
        bookingData.item ||
        bookingData.itemModel
    ) {
        await validateReferences({

            user:
                booking.user,

            trip:
                bookingData.trip ||
                booking.trip,

            item:
                bookingData.item ||
                booking.item,

            itemModel:
                bookingData.itemModel ||
                booking.itemModel,
        });
    }

    Object.entries(
        bookingData
    ).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null
            ) {
                booking[key] =
                    value;
            }
        }
    );

    await booking.save();

    return await populateBooking(
        Booking.findById(
            booking._id
        )
    );
};

const initiateExternalBooking = async ({
    bookingId,
    user,
}) => {
    const booking =
        await Booking.findOne({
            _id: bookingId,
            user,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    if (
        booking.bookingMode !==
        "ExternalRedirect"
    ) {
        throw new ApiError(
            400,
            "This booking does not use external redirect."
        );
    }

    if (
        !booking.bookingUrl
    ) {
        throw new ApiError(
            400,
            "Booking URL is not available."
        );
    }

    if (
        booking.status ===
        "Cancelled"
    ) {
        throw new ApiError(
            400,
            "Cancelled booking cannot be initiated."
        );
    }

    booking.status =
        "BookingInitiated";

    await booking.save();

    booking.status =
        "Redirected";

    booking.redirectedAt =
        new Date();

    await booking.save();

    return await populateBooking(
        Booking.findById(
            booking._id
        )
    );
};

const confirmBooking = async ({
    bookingId,
    user,
    providerBookingId,
}) => {
    const booking =
        await Booking.findOne({
            _id: bookingId,
            user,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    if (
        booking.status !==
            "Redirected" &&
        booking.status !==
            "BookingInitiated"
    ) {
        throw new ApiError(
            400,
            "Booking cannot be confirmed from its current status."
        );
    }

    booking.status =
        "Confirmed";

    booking.providerBookingId =
        providerBookingId || "";

    booking.confirmedAt =
        new Date();

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
}) => {
    const booking =
        await Booking.findOne({
            _id: bookingId,
            user,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    if (
        booking.status ===
        "Cancelled"
    ) {
        throw new ApiError(
            400,
            "Booking is already cancelled."
        );
    }

    booking.status =
        "Cancelled";

    booking.cancelledAt =
        new Date();

    await booking.save();

    return await populateBooking(
        Booking.findById(
            booking._id
        )
    );
};

const deleteBooking = async ({
    bookingId,
    user,
}) => {
    const booking =
        await Booking.findOne({
            _id: bookingId,
            user,
        });

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    booking.metadata = {
        ...(booking.metadata || {}),
        isDeleted: true,
        deletedAt:
            new Date(),
    };

    await booking.save();
};


export const bookingService = {
    createBooking,
    getAllBookings,
    getBookingById,
    searchBookings,
    filterBookings,
    updateBooking,
    initiateExternalBooking,
    confirmBooking,
    cancelBooking,
    deleteBooking,
};