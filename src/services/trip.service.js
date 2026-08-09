import { Trip } from "../models/trip.model.js";
import { User } from "../models/user.model.js";
import { Destination } from "../models/destination.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Restaurant } from "../models/restaurant.model.js";
import { Activity } from "../models/activity.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateSlug } from "../utils/generateSlug.js";

const populateTrip = (query) => {
    return query
        .populate(
            "user",
            "fullName username email avatar"
        )
        .populate(
            "destination",
            "name city state country slug"
        )
        .populate(
            "hotel",
            "name starRating pricePerNight coverImage"
        )
        .populate(
            "restaurants",
            "name averageCostForTwo coverImage"
        )
        .populate(
            "activities",
            "name category price coverImage"
        );
};

const validateReferences = async (
    tripData
) => {    

    const user =
        await User.findById(
            tripData.user
        );

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    const destination =
        await Destination.findById(
            tripData.destination
        );

    if (!destination) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }

    if (tripData.hotel) {
        const hotel =
            await Hotel.findById(
                tripData.hotel
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
            tripData.restaurants
        )
    ) {
        const count =
            await Restaurant.countDocuments({
                _id: {
                    $in: tripData.restaurants,
                },
        });

        if (
            count !==
            tripData.restaurants.length
        ) {
            throw new ApiError(
                404,
                "One or more restaurants not found."
            );
        }
    }

    if (
        Array.isArray(
            tripData.activities
        )
    ) {
        const count =
            await Activity.countDocuments({
                _id: {
                    $in: tripData.activities,
                },
        });

        if (
            count !==
            tripData.activities.length
        ) {
            throw new ApiError(
                404,
                "One or more activities not found."
            );
        }
    }
};

const createTrip = async (
    tripData
) => {

    await validateReferences(
        tripData
    );

    const destination =
        await Destination.findById(
            tripData.destination
        );

    const slug = generateSlug(
        tripData.tripName,
        destination.city,
        destination.country
    );

    // Create Trip

    const trip =
        await Trip.create({
            ...tripData,
            slug,
        });

    return await populateTrip(
        Trip.findById(
            trip._id
        )
    );
};

const getAllTrips = async ({
    page = 1,
    limit = 10,
    user,
} = {}) => {

    page = Number(page);
    limit = Number(limit);
    
    const skip = (page - 1) * limit;
    const [
        trips,
        total,
    ] = await Promise.all([
        populateTrip(
            Trip.find({
                user,
                isActive: true,
            })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
        ),

        Trip.countDocuments({
            user,
            isActive: true,
        }),
    ]);

    return {
        trips,
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

const getTripById = async (
    tripId
) => {
    const trip =
        await populateTrip(
            Trip.findById(
                tripId
            )
        );

    if (!trip) {
        throw new ApiError(
            404,
            "Trip not found."
        );
    }

    return trip;
};

const searchTrips = async (
    keyword,
    user
) => {
    if (!keyword) {
        return [];
    }

    return await populateTrip(
        Trip.find({
            user,
            isActive: true,
            $or: [
                {
                    tripName: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    aiSummary: {
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

const filterTrips = async ({
    user,
    destination,
    hotel,
    status,
    budgetType,
    isAIGenerated,
    isPublic,
} = {}) => {
    const query = {
        user,
        isActive: true,
    };

    if (destination) {
        query.destination =
            destination;
    }

    if (hotel) {
        query.hotel = hotel;
    }

    if (status) {
        query.status = status;
    }

    if (budgetType) {
        query["budget.budgetType"] =
            budgetType;
    }

    if (
        isAIGenerated !==
        undefined
    ) {
        query.isAIGenerated =
            isAIGenerated;
    }

    if (
        isPublic !==
        undefined
    ) {
        query.isPublic =
            isPublic;
    }

    return await populateTrip(
        Trip.find(query)
            .sort({
                createdAt: -1,
            })
    );
};

const updateTrip = async ({
    tripId,
    tripData,
}) => {
    const trip = await Trip.findOne({
        _id: tripId,
        isActive: true,
    });

    if (!trip) {
        throw new ApiError(
            404,
            "Trip not found."
        );
    }

    await validateReferences({
        user:
            trip.user,

        destination:
            tripData.destination ||
            trip.destination,

        hotel:
            tripData.hotel ||
            trip.hotel,

        restaurants:
            tripData.restaurants ||
            trip.restaurants,

        activities:
            tripData.activities ||
            trip.activities,
    });

    Object.entries(
        tripData
    ).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null
        ) {
            trip[key] = value;
        }
    });

    if (
        tripData.tripName ||
        tripData.destination
    ) {
        const destination =
            await Destination.findById(
                trip.destination
            );

        trip.slug =
            generateSlug(
                trip.tripName,
                destination.city,
                destination.country
            );
    }

    await trip.save();

    return await populateTrip(
        Trip.findById(
            trip._id
        )
    );
};

const deleteTrip = async (
    tripId
) => {
    const trip = await Trip.findOne({
        _id: tripId,
        isActive: true,
    });

    if (!trip) {
        throw new ApiError(
            404,
            "Trip not found."
        );
    }

    trip.isActive = false;

    await trip.save();
};

export const tripService = {
    createTrip,
    getAllTrips,
    getTripById,
    searchTrips,
    filterTrips,
    updateTrip,
    deleteTrip,
};