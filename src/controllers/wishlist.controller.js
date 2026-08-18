import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { wishlistService } from "../services/wishlist.service.js";

import {
    validateCreateWishlist,
    validateUpdateWishlist,
    validateWishlistId,
} from "../validators/wishlist.validator.js";

// Create Wishlist

const createWishlist = asyncHandler(
    async (req, res) => {
        const wishlistData = {
            ...req.body,
            user: req.user._id,
        };

        validateCreateWishlist(
            wishlistData
        );

        const wishlist =
            await wishlistService.createWishlist(
                wishlistData
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                wishlist,
                "Item added to wishlist successfully."
            )
        );
    }
);

// Get All Wishlist

const getAllWishlist = asyncHandler(
    async (req, res) => {
        const wishlist =
            await wishlistService.getAllWishlist({
                page: req.query.page,
                limit: req.query.limit,
                user: req.user._id,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                wishlist,
                "Wishlist fetched successfully."
            )
        );
    }
);

// Get Wishlist By ID

const getWishlistById =
    asyncHandler(
        async (req, res) => {
            const {
                wishlistId,
            } = req.params;

            validateWishlistId(
                wishlistId
            );

            const wishlist =
                await wishlistService.getWishlistById({
                    wishlistId,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    wishlist,
                    "Wishlist item fetched successfully."
                )
            );
        }
    );

// Get Wishlist By Item

const getWishlistByItem =
    asyncHandler(
        async (req, res) => {
            const {
                itemType,
                itemId,
            } = req.query;

            if (!itemType) {
                throw new ApiError(
                    400,
                    "Item type is required."
                );
            }

            if (!itemId) {
                throw new ApiError(
                    400,
                    "Item ID is required."
                );
            }

            const wishlist =
                await wishlistService.getWishlistByItem({
                    itemType,
                    itemId,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    wishlist,
                    wishlist
                        ? "Wishlist item fetched successfully."
                        : "Item is not in your wishlist."
                )
            );
        }
    );

// Search Wishlist

const searchWishlist =
    asyncHandler(
        async (req, res) => {
            const wishlist =
                await wishlistService.searchWishlist(
                    req.query.keyword,
                    req.user._id
                );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    wishlist,
                    "Search completed successfully."
                )
            );
        }
    );

// Filter Wishlist

const filterWishlist =
    asyncHandler(
        async (req, res) => {
            const wishlist =
                await wishlistService.filterWishlist({
                    ...req.query,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    wishlist,
                    "Wishlist filtered successfully."
                )
            );
        }
    );

// Update Wishlist

const updateWishlist =
    asyncHandler(
        async (req, res) => {
            const {
                wishlistId,
            } = req.params;

            validateWishlistId(
                wishlistId
            );

            validateUpdateWishlist(
                req.body
            );

            const wishlist =
                await wishlistService.updateWishlist({
                    wishlistId,
                    wishlistData:
                        req.body,
                    user: req.user._id,
                });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    wishlist,
                    "Wishlist updated successfully."
                )
            );
        }
    );

// Delete Wishlist

const deleteWishlist =
    asyncHandler(
        async (req, res) => {
            const {
                wishlistId,
            } = req.params;

            validateWishlistId(
                wishlistId
            );

            await wishlistService.deleteWishlist({
                wishlistId,
                user: req.user._id,
            });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {},
                    "Item removed from wishlist successfully."
                )
            );
        }
    );

export {
    createWishlist,
    getAllWishlist,
    getWishlistById,
    getWishlistByItem,
    searchWishlist,
    filterWishlist,
    updateWishlist,
    deleteWishlist,
};