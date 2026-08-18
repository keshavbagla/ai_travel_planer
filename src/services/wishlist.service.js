import { Wishlist } from "../models/wishlist.models.js";
import { User } from "../models/user.models.js";
import { Trip } from "../models/trip.models.js";
import { Hotel } from "../models/hotel.models.js";
import { Activity } from "../models/activity.models.js";
import { Restaurant } from "../models/restaurant.models.js";
import { ApiError } from "../utils/ApiError.js";

// Populate Wishlist User

const populateWishlist = (query) => {
    return query.populate(
        "user",
        "fullName email avatar"
    );
};

// Validate User

const validateUser = async (userId) => {
    const user = await User.findById(
        userId
    );

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    return user;
};

// Validate Wishlist Item

const validateWishlistItem = async ({
    itemType,
    itemId,
    user,
}) => {
    let document;

    switch (itemType) {
        case "Trip":
            document =
                await Trip.findOne({
                    _id: itemId,
                    user,
                    isActive: true,
                });
            break;

        case "Hotel":
            document =
                await Hotel.findOne({
                    _id: itemId,
                    isActive: true,
                });
            break;

        case "Activity":
            document =
                await Activity.findOne({
                    _id: itemId,
                    isActive: true,
                });
            break;

        case "Restaurant":
            document =
                await Restaurant.findOne({
                    _id: itemId,
                    isActive: true,
                });
            break;

        default:
            throw new ApiError(
                400,
                "Invalid wishlist item type."
            );
    }

    if (!document) {
        throw new ApiError(
            404,
            `${itemType} not found.`
        );
    }

    return document;
};

// Create Wishlist

const createWishlist = async (
    wishlistData
) => {
    await validateUser(
        wishlistData.user
    );

    await validateWishlistItem({
        itemType:
            wishlistData.itemType,
        itemId:
            wishlistData.itemId,
        user: wishlistData.user,
    });

    // Prevent Duplicate Wishlist Entry

    const existingWishlist =
        await Wishlist.findOne({
            user: wishlistData.user,
            itemType:
                wishlistData.itemType,
            itemId:
                wishlistData.itemId,
        });

    if (existingWishlist) {
        throw new ApiError(
            409,
            "This item is already in your wishlist."
        );
    }

    let wishlist;

    try {
        wishlist =
            await Wishlist.create(
                wishlistData
            );
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(
                409,
                "This item is already in your wishlist."
            );
        }

        throw error;
    }

    return await populateWishlist(
        Wishlist.findById(
            wishlist._id
        )
    );
};

// Get All Wishlist Items

const getAllWishlist = async ({
    page = 1,
    limit = 10,
    user,
} = {}) => {
    page = Number(page);
    limit = Number(limit);

    const skip =
        (page - 1) * limit;

    const [
        wishlist,
        total,
    ] = await Promise.all([
        populateWishlist(
            Wishlist.find({
                user,
                isActive: true,
            })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
        ),

        Wishlist.countDocuments({
            user,
            isActive: true,
        }),
    ]);

    return {
        wishlist,
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

// Get Wishlist By ID

const getWishlistById = async ({
    wishlistId,
    user,
}) => {
    const wishlist =
        await populateWishlist(
            Wishlist.findOne({
                _id: wishlistId,
                user,
                isActive: true,
            })
        );

    if (!wishlist) {
        throw new ApiError(
            404,
            "Wishlist item not found."
        );
    }

    return wishlist;
};

// Get Wishlist By Item

const getWishlistByItem = async ({
    itemType,
    itemId,
    user,
}) => {
    const wishlist =
        await populateWishlist(
            Wishlist.findOne({
                user,
                itemType,
                itemId,
                isActive: true,
            })
        );

    return wishlist;
};

// Search Wishlist

const searchWishlist = async (
    keyword,
    user
) => {
    if (!keyword) {
        return [];
    }

    const matchingItems = [];

    const [
        trips,
        hotels,
        activities,
        restaurants,
    ] = await Promise.all([
        Trip.find({
            user,
            isActive: true,
            tripName: {
                $regex: keyword,
                $options: "i",
            },
        }).select("_id"),

        Hotel.find({
            name: {
                $regex: keyword,
                $options: "i",
            },
            isActive: true,
        }).select("_id"),

        Activity.find({
            name: {
                $regex: keyword,
                $options: "i",
            },
            isActive: true,
        }).select("_id"),

        Restaurant.find({
            name: {
                $regex: keyword,
                $options: "i",
            },
            isActive: true,
        }).select("_id"),
    ]);

    const idsByType = {
        Trip: trips.map(
            (item) => item._id
        ),
        Hotel: hotels.map(
            (item) => item._id
        ),
        Activity: activities.map(
            (item) => item._id
        ),
        Restaurant: restaurants.map(
            (item) => item._id
        ),
    };

    for (const [
        itemType,
        itemIds,
    ] of Object.entries(
        idsByType
    )) {
        if (!itemIds.length) {
            continue;
        }

        const items =
            await Wishlist.find({
                user,
                itemType,
                itemId: {
                    $in: itemIds,
                },
                isActive: true,
            });

        matchingItems.push(
            ...items
        );
    }

    return await populateWishlist(
        Wishlist.find({
            _id: {
                $in: matchingItems.map(
                    (item) => item._id
                ),
            },
        }).sort({
            createdAt: -1,
        })
    );
};

// Filter Wishlist

const filterWishlist = async ({
    user,
    itemType,
} = {}) => {
    const query = {
        user,
        isActive: true,
    };

    if (itemType) {
        query.itemType =
            itemType;
    }

    return await populateWishlist(
        Wishlist.find(query).sort({
            createdAt: -1,
        })
    );
};

// Update Wishlist Notes

const updateWishlist = async ({
    wishlistId,
    wishlistData,
    user,
}) => {
    const wishlist =
        await Wishlist.findOne({
            _id: wishlistId,
            user,
            isActive: true,
        });

    if (!wishlist) {
        throw new ApiError(
            404,
            "Wishlist item not found."
        );
    }

    // Only notes can be updated

    if (
        wishlistData.notes !==
        undefined
    ) {
        wishlist.notes =
            wishlistData.notes;
    }

    await wishlist.save();

    return await populateWishlist(
        Wishlist.findById(
            wishlist._id
        )
    );
};

// Delete Wishlist

const deleteWishlist = async ({
    wishlistId,
    user,
}) => {
    const wishlist =
        await Wishlist.findOne({
            _id: wishlistId,
            user,
            isActive: true,
        });

    if (!wishlist) {
        throw new ApiError(
            404,
            "Wishlist item not found."
        );
    }

    wishlist.isActive = false;

    await wishlist.save();
};

export const wishlistService = {
    createWishlist,
    getAllWishlist,
    getWishlistById,
    getWishlistByItem,
    searchWishlist,
    filterWishlist,
    updateWishlist,
    deleteWishlist,
};