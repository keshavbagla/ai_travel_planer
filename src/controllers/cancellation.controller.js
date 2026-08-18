import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cancellationService } from "../services/cancellation.service.js";

import {
    validateCreateCancellation,
    validateCancellationId,
} from "../validators/cancellation.validator.js";

// Create Cancellation

const createCancellation =
    asyncHandler(
        async (req, res) => {
            const cancellationData = {
                bookingId:
                    req.body.bookingId,
                reason:
                    req.body.reason,
                user: req.user._id,
            };

            validateCreateCancellation(
                cancellationData
            );

            const cancellation =
                await cancellationService.createCancellation(
                    cancellationData
                );

            return res.status(201).json(
                new ApiResponse(
                    201,
                    cancellation,
                    "Booking cancelled successfully."
                )
            );
        }
    );

// Get All Cancellations

const getAllCancellations =
    asyncHandler(
        async (req, res) => {
            const cancellations =
                await cancellationService.getAllCancellations(
                    {
                        page:
                            req.query.page,
                        limit:
                            req.query.limit,
                        user:
                            req.user._id,
                    }
                );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    cancellations,
                    "Cancellations fetched successfully."
                )
            );
        }
    );

// Get Cancellation By ID

const getCancellationById =
    asyncHandler(
        async (req, res) => {
            const {
                cancellationId,
            } = req.params;

            validateCancellationId(
                cancellationId
            );

            const cancellation =
                await cancellationService.getCancellationById(
                    {
                        cancellationId,
                        user:
                            req.user._id,
                    }
                );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    cancellation,
                    "Cancellation fetched successfully."
                )
            );
        }
    );

export {
    createCancellation,
    getAllCancellations,
    getCancellationById,
};