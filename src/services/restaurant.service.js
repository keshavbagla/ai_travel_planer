import mongoose from "mongoose";
import slugify from "slugify";
import { Restaurant } from "../models/restaurant.model.js";
import { Destination } from "../models/destination.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import {
    geoapifyClient,
    GEOAPIFY_API_KEY,
} from "../config/geoapify.js";

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
        // Upload Cover Image
        
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

        // Upload Gallery Images

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

// Get All Restaurants

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

    // Search
   
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

    // Sorting
    
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

// Get Restaurant By ID

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

// Search Restaurants

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

// Search Restaurants from Geoapify

const searchExternalRestaurants = async ({
    destinationId,
    limit = 20,
}) => {
    const destination =
        await Destination.findById(
            destinationId
        ).select(
            "name city country location"
        );

    if (!destination) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }

    const coordinates =
        destination.location?.coordinates;

    if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 2
    ) {
        throw new ApiError(
            400,
            "Destination coordinates are not available."
        );
    }

    const [
        longitude,
        latitude,
    ] = coordinates;

    try {
        const response =
            await geoapifyClient.get(
                "/v2/places",
                {
                    params: {
                        categories:
                            "catering.restaurant",

                        filter:
                            `circle:${longitude},${latitude},10000`,

                        limit: Math.min(
                            Number(limit) || 20,
                            50
                        ),

                        lang: "en",

                        apiKey:
                            GEOAPIFY_API_KEY,
                    },
                }
            );

        const features =
            Array.isArray(
                response.data?.features
            )
                ? response.data.features
                : [];

        return features
            .map((feature) => {
                const properties =
                    feature?.properties || {};

                const [
                    lon,
                    lat,
                ] =
                    feature?.geometry
                        ?.coordinates || [];

                if (
                    !Number.isFinite(
                        Number(lon)
                    ) ||
                    !Number.isFinite(
                        Number(lat)
                    )
                ) {
                    return null;
                }

                return {
                    geoapifyPlaceId:
                        properties.place_id ||
                        null,

                    name:
                        properties.name ||
                        properties.address_line1 ||
                        "Restaurant",

                    description:
                        properties.address_line2 ||
                        "",

                    destination:
                        destination._id,

                    address:
                        properties.formatted ||
                        "",

                    city:
                        properties.city ||
                        destination.city,

                    state:
                        properties.state ||
                        "",

                    country:
                        properties.country ||
                        destination.country,

                    location: {
                        type: "Point",
                        coordinates: [
                            Number(lon),
                            Number(lat),
                        ],
                    },

                    cuisine:
                        properties.catering
                            ?.cuisine
                            ? [
                                  properties
                                      .catering
                                      .cuisine,
                              ]
                            : [],

                    averageCostForTwo: 0,

                    currency: "INR",

                    averageRating:
                        Number(
                            properties
                                .catering
                                ?.stars
                        ) || 0,

                    reviewCount: 0,

                    amenities: [],

                    dietaryOptions: [],

                    tableReservation:
                        properties
                            .catering
                            ?.reservation ===
                        "required",

                    takeawayAvailable: false,

                    deliveryAvailable: false,

                    phone:
                        properties.contact
                            ?.phone ||
                        "",

                    email:
                        properties.contact
                            ?.email ||
                        "",

                    website:
                        properties.website ||
                        properties.contact
                            ?.website ||
                        "",

                    isFeatured: false,

                    isActive: true,
                };
            })
            .filter(Boolean);

    } catch (error) {
        console.error(
            "Geoapify restaurant search error:",
            error.response?.data ||
                error.message
        );

        throw new ApiError(
            error.response?.status ||
                502,
            "Unable to fetch restaurants from Geoapify."
        );
    }
};

const saveExternalRestaurant = async ({
    restaurantData,
}) => {
    const {
        geoapifyPlaceId,
        destination,
        name,
        description = "",
        address = "",
        city = "",
        state = "",
        country = "",
        location,
        cuisine = [],
        phone = "",
        email = "",
        website = "",
    } = restaurantData;

    if (!geoapifyPlaceId) {
        throw new ApiError(
            400,
            "Geoapify place ID is required."
        );
    }

    if (!destination) {
        throw new ApiError(
            400,
            "Destination is required."
        );
    }

    const destinationExists =
        await Destination.exists({
            _id: destination,
            isActive: true,
        });

    if (!destinationExists) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }

    const existing =
        await Restaurant.findOne({
            geoapifyPlaceId,
        });

    if (existing) {
        return existing;
    }

    const slug = generateSlug(
        name,
        city || "",
        country || ""
    );

    const restaurant =
        await Restaurant.create({
            name,
            slug,
            description,
            destination,
            address,
            city,
            state,
            country,
            location,
            cuisine,
            phone,
            email,
            website,
            averageCostForTwo: 0,
            currency: "INR",
            averageRating: 0,
            reviewCount: 0,
            amenities: [],
            dietaryOptions: [],
            tableReservation: false,
            takeawayAvailable: false,
            deliveryAvailable: false,
            isFeatured: false,
            isActive: true,
        });

    return restaurant;
};

// Filter Restaurants

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

    // Filters
    
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

// Update Restaurant

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

    // Verify Destination (if changed)
    
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
        // Upload New Cover Image
        
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

        // Upload New Gallery Images

        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );

            restaurant.galleryImages =
                uploadedGalleryImages;
        }

        // Update Remaining Fields
        
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

        // Regenerate Slug
        
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

        // Delete Old Cover Image
        
        if (
            coverImage &&
            oldCoverImage?.publicId
        ) {
            await deleteFromCloudinary(
                oldCoverImage.publicId
            );
        }

        // Delete Old Gallery Images
        
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
        // Rollback Uploaded Cover
        
        if (
            uploadedCoverImage?.publicId
        ) {
            await deleteFromCloudinary(
                uploadedCoverImage.publicId
            );
        }

        // Rollback Uploaded Gallery
        
        await deleteGalleryImages(
            uploadedGalleryImages
        );

        throw error;
    }
};

// Delete Restaurant

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
    searchExternalRestaurants,
    saveExternalRestaurant,
    filterRestaurants,
    updateRestaurant,
    deleteRestaurant,
};