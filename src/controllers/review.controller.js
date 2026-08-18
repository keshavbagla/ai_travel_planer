import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { reviewService } from "../services/review.services.js";

import {
    validateCreateReview,
    validateUpdateReview,
    validateReviewId,
} from "../validators/review.validator.js";

const createReview = asyncHandler(
    async (req, res) => {
        const reviewData = {
            ...req.body,
            user: req.user._id,
        };

        validateCreateReview(
            reviewData
        );

        const review =
            await reviewService.createReview(
                reviewData
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                review,
                "Review created successfully."
            )
        );
    }
);

const getAllReviews = asyncHandler(
    async (req, res) => {
        const reviews =
            await reviewService.getAllReviews({
                page: req.query.page,
                limit: req.query.limit,
                user: req.user._id,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                reviews,
                "Reviews fetched successfully."
            )
        );
    }
);

const getReviewById =
    asyncHandler(
        async (req, res) => {
            const {
                reviewId,
            } = req.params;

            validateReviewId(
                reviewId
            );

            const review =
                await reviewService.getReviewById({
                    reviewId,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    review,
                    "Review fetched successfully."
                )
            );
        }
    );

const getReviewsForEntity =
    asyncHandler(
        async (req, res) => {
            const {
                reviewType,
                referenceId,
            } = req.query;

            if (!reviewType) {
                throw new ApiError(
                    400,
                    "Review type is required."
                );
            }

            if (!referenceId) {
                throw new ApiError(
                    400,
                    "Reference ID is required."
                );
            }

            const reviews =
                await reviewService.getReviewsForEntity({
                    reviewType,
                    referenceId,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    reviews,
                    "Entity reviews fetched successfully."
                )
            );
        }
    );

// Search Reviews

const searchReviews =
    asyncHandler(
        async (req, res) => {
            const reviews =
                await reviewService.searchReviews(
                    req.query.keyword,
                    req.user._id
                );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    reviews,
                    "Search completed successfully."
                )
            );
        }
    );

const filterReviews =
    asyncHandler(
        async (req, res) => {
            const reviews =
                await reviewService.filterReviews({
                    ...req.query,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    reviews,
                    "Reviews filtered successfully."
                )
            );
        }
    );

const updateReview =
    asyncHandler(
        async (req, res) => {
            const {
                reviewId,
            } = req.params;

            validateReviewId(
                reviewId
            );

            validateUpdateReview(
                req.body
            );

            const review =
                await reviewService.updateReview({
                    reviewId,
                    reviewData:
                        req.body,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    review,
                    "Review updated successfully."
                )
            );
        }
    );

const deleteReview =
    asyncHandler(
        async (req, res) => {
            const {
                reviewId,
            } = req.params;

            validateReviewId(
                reviewId
            );

            await reviewService.deleteReview({
                reviewId,
                user: req.user._id,
            });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {},
                    "Review deleted successfully."
                )
            );
        }
    );

export {
    createReview,
    getAllReviews,
    getReviewById,
    getReviewsForEntity,
    searchReviews,
    filterReviews,
    updateReview,
    deleteReview,
};