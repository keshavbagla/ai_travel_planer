import mongoose from "mongoose";
import slugify from "slugify";
import { Restaurant } from "../models/restaurant.model.js";
import { Destination } from "../models/destinations.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

const generateSlug = (
    name,
    city,
    country
) => {
    return slugify(
        `${name}-${city}-${country}`,
        {
            lower: true,
            strict: true,
        }
    );

};

const uploadGalleryImages = async (
    galleryImages
) => {
    const uploadedImages = [];

    for (const image of galleryImages) {
        const uploaded =
            await uploadOnCloudinary(
                image.path,
                "ai-travel-planner/restaurants"
            );

        if (!uploaded) {
            throw new ApiError(
                500,
                "Failed to upload gallery image."
            );
        }

        uploadedImages.push({
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            caption: "",
        });
    }

    return uploadedImages;
};

const deleteGalleryImages = async (
    galleryImages
) => {
    if (
        !galleryImages ||
        galleryImages.length === 0
    ) {
        return;
    }

    for (const image of galleryImages) {
        if (image.publicId) {
            await deleteFromCloudinary(
                image.publicId
            );
        }
    }
};

const createRestaurant = async ({
    restaurantData,
    coverImage,
    galleryImages = [],
}) => {

    const destination =
        await Destination.findById(
            restaurantData.destination
        );

    if (!destination) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }

    const slug = generateSlug(
        restaurantData.name,
        restaurantData.city,
        restaurantData.country
    );

    let uploadedCoverImage = null;
    let uploadedGalleryImages = [];

    try {
        
        if (coverImage) {
            const response =
                await uploadOnCloudinary(
                    coverImage.path,
                    "ai-travel-planner/restaurants/cover"
                );

            if (!response) {
                throw new ApiError(
                    500,
                    "Failed to upload cover image."
                );
            }

            uploadedCoverImage = {
                url: response.secure_url,
                publicId: response.public_id,
                caption: restaurantData.name,
            };
        }

        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );
        }

        // Create Restaurant
        
        const restaurant =
            await Restaurant.create({
                ...restaurantData,
                slug,
                coverImage:
                    uploadedCoverImage,
                galleryImages:
                    uploadedGalleryImages,
            });

        return restaurant;
    }

    catch (error) {
        // Rollback Uploaded Images
        
        if (
            uploadedCoverImage?.publicId
        ) {
            await deleteFromCloudinary(
                uploadedCoverImage.publicId
            );
        }

        await deleteGalleryImages(
            uploadedGalleryImages
        );

        throw error;
    }
};

const getAllRestaurants = async ({
    page = 1,
    limit = 10,
    search = "",
    destination,
    city,
    country,
    restaurantType,
    cuisine,
    minRating,
    minCost,
    maxCost,
    isFeatured,
    sort = "newest",
}) => {
    page = Number(page);
    limit = Number(limit);

    const query = {
        isActive: true,
    };
   
    if (search) {
        query.$or = [
            {
                name: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                city: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                country: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                description: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }

    // Filters
   
    if (destination) {
        query.destination = destination;
    }

    if (city) {
        query.city = city;
    }

    if (country) {
        query.country = country;
    }

    if (restaurantType) {
        query.restaurantType =
            restaurantType;
    }

    if (cuisine) {
        query.cuisine = cuisine;
    }

    if (minRating) {
        query.averageRating = {
            $gte: Number(minRating),
        };

    }

    if (minCost || maxCost) {
        query.averageCostForTwo = {};

        if (minCost) {
            query.averageCostForTwo.$gte =
                Number(minCost);
        }

        if (maxCost) {
            query.averageCostForTwo.$lte =
                Number(maxCost);
        }
    }

    if (isFeatured !== undefined) {
        query.isFeatured =
            isFeatured === "true";
    }
    
    let sortOption = {
        createdAt: -1,
    };

    switch (sort) {
        case "costLow":
            sortOption = {
                averageCostForTwo: 1,
            };

            break;

        case "costHigh":
            sortOption = {
                averageCostForTwo: -1,
            };

            break;

        case "rating":
            sortOption = {
                averageRating: -1,
            };

            break;

        case "popularity":
            sortOption = {
                popularityScore: -1,
            };

            break;

        case "alphabetical":
            sortOption = {
                name: 1,
            };

            break;

        case "oldest":
            sortOption = {
                createdAt: 1,
            };

            break;

        default:
            sortOption = {
                createdAt: -1,
            };
    }

    const skip =
        (page - 1) * limit;

    const [restaurants, total] =
        await Promise.all([
            Restaurant.find(query)
                .select("-__v")
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate(
                    "destination",
                    "name city state country slug"
                )
                .lean(),

            Restaurant.countDocuments(query),
        ]);

    return {
        restaurants,
        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(total / limit),
        },
    };
};

const getRestaurantById = async (
    restaurantId
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            restaurantId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid restaurant ID."
        );
    }

    const restaurant =
        await Restaurant.findById(
            restaurantId
        )
            .select("-__v")
            .populate(
                "destination",
                "name city state country slug"
            )
            .lean();

    if (!restaurant) {
        throw new ApiError(
            404,
            "Restaurant not found."
        );
    }

    return restaurant;
};

const searchRestaurants = async (
    keyword
) => {
    if (!keyword) {
        return [];
    }

    return await Restaurant.find({
        isActive: true,
        $or: [
            {
                name: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                city: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                country: {
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
                cuisine: {
                    $in: [
                        new RegExp(
                            keyword,
                            "i"
                        ),
                    ],
                },
            },
            {
                amenities: {
                    $in: [
                        new RegExp(
                            keyword,
                            "i"
                        ),
                    ],
                },
            },
        ],
    })
        .select("-__v")
        .populate(
            "destination",
            "name city state country slug"
        )
        .sort({
            popularityScore: -1,
        })
        .limit(20)
        .lean();
};

const filterRestaurants = async ({
    destination,
    city,
    country,
    restaurantType,
    cuisine,
    dietaryOptions,
    minCost,
    maxCost,
    minRating,
}) => {
    const query = {
        isActive: true,
    };
    
    if (destination) {
        query.destination =
            destination;
    }

    if (city) {
        query.city = city;
    }

    if (country) {
        query.country = country;
    }

    if (restaurantType) {
        query.restaurantType =
            restaurantType;
    }

    if (cuisine) {
        query.cuisine = cuisine;
    }

    if (dietaryOptions) {
        const optionList =
            dietaryOptions
                .split(",")
                .map((item) =>
                    item.trim()
                );

        query.dietaryOptions = {
            $all: optionList,
        };
    }

    if (
        minCost ||
        maxCost
    ) {
        query.averageCostForTwo = {};

        if (minCost) {
            query.averageCostForTwo.$gte =
                Number(minCost);
        }

        if (maxCost) {
            query.averageCostForTwo.$lte =
                Number(maxCost);
        }
    }

    if (minRating) {
        query.averageRating = {
            $gte:
                Number(minRating),
        };
    }

    return await Restaurant.find(query)
        .select("-__v")
        .populate(
            "destination",
            "name city state country slug"
        )
        .sort({
            popularityScore: -1,
        })
        .lean();
};

const updateRestaurant = async ({
    restaurantId,
    restaurantData,
    coverImage,
    galleryImages = [],
}) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            restaurantId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid restaurant ID."
        );
    }

    const restaurant =
        await Restaurant.findById(
            restaurantId
        );

    if (!restaurant) {
        throw new ApiError(
            404,
            "Restaurant not found."
        );
    }
    
    if (restaurantData.destination) {
        const destination =
            await Destination.findById(
                restaurantData.destination
            );

        if (!destination) {
            throw new ApiError(
                404,
                "Destination not found."
            );
        }
    }

    const oldCoverImage =
        restaurant.coverImage;

    const oldGalleryImages =
        restaurant.galleryImages;

    let uploadedCoverImage = null;
    let uploadedGalleryImages = [];

    try {
        
        if (coverImage) {
            const response =
                await uploadOnCloudinary(
                    coverImage.path,
                    "ai-travel-planner/restaurants/cover"
                );

            if (!response) {
                throw new ApiError(
                    500,
                    "Failed to upload cover image."
                );
            }

            uploadedCoverImage = {
                url: response.secure_url,
                publicId: response.public_id,
                caption:
                    restaurantData.name ||
                    restaurant.name,
            };

            restaurant.coverImage =
                uploadedCoverImage;
        }

        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );

            restaurant.galleryImages =
                uploadedGalleryImages;
        }
        
        Object.entries(
            restaurantData
        ).forEach(
            ([key, value]) => {
                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    restaurant[key] = value;
                }
            }
        );
        
        if (
            restaurantData.name ||
            restaurantData.city ||
            restaurantData.country
        ) {
            restaurant.slug =
                generateSlug(
                    restaurantData.name ||
                        restaurant.name,

                    restaurantData.city ||
                        restaurant.city,

                    restaurantData.country ||
                        restaurant.country
                );
        }

        await restaurant.save();
        
        if (
            coverImage &&
            oldCoverImage?.publicId
        ) {
            await deleteFromCloudinary(
                oldCoverImage.publicId
            );
        }
        
        if (
            galleryImages.length > 0
        ) {
            await deleteGalleryImages(
                oldGalleryImages
            );
        }

        return restaurant;
    }

    catch (error) {
        
        if (
            uploadedCoverImage?.publicId
        ) {
            await deleteFromCloudinary(
                uploadedCoverImage.publicId
            );
        }
        
        await deleteGalleryImages(
            uploadedGalleryImages
        );

        throw error;
    }
};

const deleteRestaurant = async (
    restaurantId
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            restaurantId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid restaurant ID."
        );
    }

    const restaurant =
        await Restaurant.findById(
            restaurantId
        );

    if (!restaurant) {
        throw new ApiError(
            404,
            "Restaurant not found."
        );
    }
    
    if (
        restaurant.coverImage?.publicId
    ) {
        await deleteFromCloudinary(
            restaurant.coverImage.publicId
        );
    }
    
    await deleteGalleryImages(
        restaurant.galleryImages
    );
    
    await restaurant.deleteOne();

    return true;
};

export const restaurantService = {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    searchRestaurants,
    filterRestaurants,
    updateRestaurant,
    deleteRestaurant,
};