import { tripService } from "../services/trip.service.js";
import {
    validateCreateTrip,
    validateUpdateTrip,
    validateTripId,
} from "../validators/trip.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const parseJSONField = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    }
    catch {
        throw new ApiError(
            400,
            "Invalid JSON format."
        );
    }
};

const createTrip = asyncHandler(async (req, res) => {
    req.body.travelers =
        parseJSONField(req.body.travelers);

    req.body.budget =
        parseJSONField(req.body.budget);

    req.body.preferences =
        parseJSONField(req.body.preferences);

    req.body.restaurants =
        parseJSONField(req.body.restaurants);

    req.body.activities =
        parseJSONField(req.body.activities);

    req.body.itinerary =
        parseJSONField(req.body.itinerary);

    req.body.user = req.user._id;

    validateCreateTrip(req.body);

    const trip =
    await tripService.createTrip(req.body);

    return res.status(201).json(
        new ApiResponse(
            201,
            trip,
            "Trip created successfully."
        )
    );
});

const getAllTrips = asyncHandler(async (req, res) => {
    const trips =
        await tripService.getAllTrips({
            ...req.query,
            user: req.user._id,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            trips,
            "Trips fetched successfully."
        )
    );
});

const getTripById = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    validateTripId(
        tripId
    );

    const trip =
        await tripService.getTripById(
            tripId
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            trip,
            "Trip fetched successfully."
        )
    );
});

const searchTrips = asyncHandler(async (req, res) => {
    const trips =
        await tripService.searchTrips(
            req.query.keyword,
            req.user._id,
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            trips,
            "Search completed successfully."
        )
    );
});

const filterTrips = asyncHandler(async (req, res) => {
    const trips =
        await tripService.filterTrips({  
            ...req.query,
            user: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            trips,
            "Trips filtered successfully."
        )
    );
});

const updateTrip = asyncHandler(async (req, res) => {
    if(req.body.travelers){
        req.body.travelers = parseJSONField(req.body.travelers);
    }
    if(req.body.budget){
        req.body.budget = parseJSONField(req.body.budget);
    }
    if(req.body.preferences){
        req.body.preferences = parseJSONField(req.body.preferences);
    }
    if(req.body.restaurants){
        req.body.restaurants = parseJSONField(req.body.restaurants);
    }
    if(req.body.activities){
        req.body.activities = parseJSONField(req.body.activities);
    }
    if(req.body.itinerary){
        req.body.itinerary = parseJSONField(req.body.itinerary);
    }

    const { tripId } = req.params;

    validateTripId(
        tripId
    );

    const existingTrip =
        await tripService.getTripById(
            tripId
        );

    if (
        existingTrip.user._id.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to update this trip."
        );
    }

    validateUpdateTrip(
        req.body
    );

    const trip =
        await tripService.updateTrip({
            tripId,
            tripData: req.body,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            trip,
            "Trip updated successfully."
        )
    );
});

const deleteTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    validateTripId(
        tripId
    );

    const existingTrip =
    await tripService.getTripById(
        tripId
    );

    if (
        existingTrip.user._id.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to delete this trip."
        );
    }

    await tripService.deleteTrip(
        tripId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Trip deleted successfully."
        )
    );
});

export {
    createTrip,
    getAllTrips,
    getTripById,
    searchTrips,
    filterTrips,
    updateTrip,
    deleteTrip,
};