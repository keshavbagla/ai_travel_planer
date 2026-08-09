import { destinationService } from "../services/destination.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
    validateCreateDestination,
    validateUpdateDestination,
    validateDestinationId,
} from "../validators/destination.validator.js";

const parseJSONField = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const createDestination = asyncHandler(async (req, res) => {
    req.body.location = parseJSONField(req.body.location);
    req.body.destinationType = parseJSONField(req.body.destinationType);
    req.body.travelStyles = parseJSONField(req.body.travelStyles);
    req.body.suitableFor = parseJSONField(req.body.suitableFor);
    req.body.averageDailyBudget = parseJSONField(req.body.averageDailyBudget);
    req.body.transportation = parseJSONField(req.body.transportation);
    req.body.aiScores = parseJSONField(req.body.aiScores);
    req.body.bestMonths = parseJSONField(req.body.bestMonths);
    req.body.popularActivities = parseJSONField(req.body.popularActivities);
    req.body.famousFor = parseJSONField(req.body.famousFor);
    req.body.languages = parseJSONField(req.body.languages);
    req.body.recommendedDuration = parseJSONField(req.body.recommendedDuration);

    validateCreateDestination(req.body);

    const coverImage = req.files?.coverImage?.[0];
    
    const galleryImages = req.files?.galleryImages || [];

    const destination = await destinationService.createDestination({
        destinationData: req.body,
        coverImage,
        galleryImages,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            destination,
            "Destination created successfully."
        )
    );
});

const getAllDestinations = asyncHandler(async (req, res) => {
    const result = await destinationService.getAllDestinations(req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Destinations fetched successfully."
        )
    );
});

const getDestinationById = asyncHandler(async (req, res) => {
    const { destinationId } = req.params;

    validateDestinationId(destinationId);

    const destination =
        await destinationService.getDestinationById(destinationId);
    
    if (!destination) {
        throw new ApiError(404, "Destination not found.");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            destination,
            "Destination fetched successfully."
        )
    );
});

const updateDestination = asyncHandler(async (req, res) => {
    if (req.body.location) {
        req.body.location = parseJSONField(req.body.location);
    }

    if (req.body.destinationType) {
        req.body.destinationType = parseJSONField(req.body.destinationType);
    }

    if (req.body.travelStyles) {
        req.body.travelStyles = parseJSONField(req.body.travelStyles);
    }

    if (req.body.suitableFor) {
        req.body.suitableFor = parseJSONField(req.body.suitableFor);
    }

    if (req.body.averageDailyBudget) {
        req.body.averageDailyBudget = parseJSONField(req.body.averageDailyBudget);
    }

    if (req.body.transportation) {
        req.body.transportation = parseJSONField(req.body.transportation);
    }

    if (req.body.aiScores) {
        req.body.aiScores = parseJSONField(req.body.aiScores);
    }

    if (req.body.bestMonths) {
        req.body.bestMonths = parseJSONField(req.body.bestMonths);
    }

    if (req.body.popularActivities) {
        req.body.popularActivities = parseJSONField(req.body.popularActivities);
    }

    if (req.body.famousFor) {
        req.body.famousFor = parseJSONField(req.body.famousFor);
    }

    if (req.body.languages) {
        req.body.languages = parseJSONField(req.body.languages);
    }

    if (req.body.recommendedDuration) {
        req.body.recommendedDuration = parseJSONField(req.body.recommendedDuration);
    }
        
    const { destinationId } = req.params;

    validateDestinationId(destinationId);
    validateUpdateDestination(req.body);

    const coverImage = req.files?.coverImage?.[0];
    const galleryImages = req.files?.galleryImages || [];

    const destination = await destinationService.updateDestination({
            destinationId,
            destinationData: req.body,
            coverImage,
            galleryImages,
    });
    
    if (!destination) {
        throw new ApiError(404, "Destination not found.");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            destination,
            "Destination updated successfully."
        )
    );
});

const deleteDestination = asyncHandler(async (req, res) => {
    const { destinationId } = req.params;

    validateDestinationId(destinationId);

    const destination = await destinationService.deleteDestination(destinationId);

    if (!destination) {
        throw new ApiError(404, "Destination not found.");
    }
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Destination deleted successfully."
        )
    );
});

const searchDestinations = asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        throw new ApiError(
            400,
            "Search keyword is required."
        );
    }

    const destinations =
        await destinationService.searchDestinations(keyword);

    return res.status(200).json(
        new ApiResponse(
            200,
            destinations,
            "Search completed successfully."
        )
    );
});


const filterDestinations = asyncHandler(async (req, res) => {
    const destinations =
        await destinationService.filterDestinations(req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            destinations,
            "Destinations filtered successfully."
        )
    );
});

export {
    createDestination,
    getAllDestinations,
    getDestinationById,
    updateDestination,
    deleteDestination,
    searchDestinations,
    filterDestinations,
};