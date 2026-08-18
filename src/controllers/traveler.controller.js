import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { travelerService } from "../services/traveler.service.js";

import {
    validateCreateTraveler,
    validateUpdateTraveler,
    validateTravelerId,
} from "../validators/traveler.validator.js";

// Create Traveler

const createTraveler = asyncHandler(
    async (req, res) => {
        const travelerData = {
            firstName:
                req.body.firstName,
            lastName:
                req.body.lastName,
            dateOfBirth:
                req.body.dateOfBirth,
            gender:
                req.body.gender,
            nationality:
                req.body.nationality,
            email:
                req.body.email,
            phone:
                req.body.phone,
            passport:
                req.body.passport,
            travelerType:
                req.body.travelerType,
            isPrimary:
                req.body.isPrimary,
        };

        validateCreateTraveler(
            travelerData
        );

        const traveler =
            await travelerService.createTraveler(
                {
                    travelerData,
                    user: req.user._id,
                }
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                traveler,
                "Traveler created successfully."
            )
        );
    }
);

// Get All Travelers

const getAllTravelers = asyncHandler(
    async (req, res) => {
        const result =
            await travelerService.getAllTravelers(
                {
                    user: req.user._id,
                    page:
                        req.query.page,
                    limit:
                        req.query.limit,
                }
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Travelers fetched successfully."
            )
        );
    }
);

// Get Traveler By ID

const getTravelerById = asyncHandler(
    async (req, res) => {
        const {
            travelerId,
        } = req.params;

        validateTravelerId(
            travelerId
        );

        const traveler =
            await travelerService.getTravelerById(
                {
                    travelerId,
                    user:
                        req.user._id,
                }
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                traveler,
                "Traveler fetched successfully."
            )
        );
    }
);

// Update Traveler

const updateTraveler = asyncHandler(
    async (req, res) => {
        const {
            travelerId,
        } = req.params;

        validateTravelerId(
            travelerId
        );

        const travelerData = {
            firstName:
                req.body.firstName,
            lastName:
                req.body.lastName,
            dateOfBirth:
                req.body.dateOfBirth,
            gender:
                req.body.gender,
            nationality:
                req.body.nationality,
            email:
                req.body.email,
            phone:
                req.body.phone,
            passport:
                req.body.passport,
            travelerType:
                req.body.travelerType,
            isPrimary:
                req.body.isPrimary,
        };

        // Remove undefined fields

        Object.keys(
            travelerData
        ).forEach((key) => {
            if (
                travelerData[key] ===
                undefined
            ) {
                delete travelerData[
                    key
                ];
            }
        });

        validateUpdateTraveler(
            travelerData
        );

        const traveler =
            await travelerService.updateTraveler(
                {
                    travelerId,
                    travelerData,
                    user:
                        req.user._id,
                }
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                traveler,
                "Traveler updated successfully."
            )
        );
    }
);

// Delete Traveler

const deleteTraveler = asyncHandler(
    async (req, res) => {
        const {
            travelerId,
        } = req.params;

        validateTravelerId(
            travelerId
        );

        await travelerService.deleteTraveler(
            {
                travelerId,
                user:
                    req.user._id,
            }
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Traveler deleted successfully."
            )
        );
    }
);

// Set Primary Traveler

const setPrimaryTraveler =
    asyncHandler(
        async (req, res) => {
            const {
                travelerId,
            } = req.params;

            validateTravelerId(
                travelerId
            );

            const traveler =
                await travelerService.setPrimaryTraveler(
                    {
                        travelerId,
                        user:
                            req.user._id,
                    }
                );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    traveler,
                    "Primary traveler updated successfully."
                )
            );
        }
    );

// Search Travelers

const searchTravelers = asyncHandler(
    async (req, res) => {
        const {
            keyword,
        } = req.query;

        const travelers =
            await travelerService.searchTravelers(
                {
                    keyword,
                    user:
                        req.user._id,
                }
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                travelers,
                "Search completed successfully."
            )
        );
    }
);

export {
    createTraveler,
    getAllTravelers,
    getTravelerById,
    updateTraveler,
    deleteTraveler,
    setPrimaryTraveler,
    searchTravelers,
};