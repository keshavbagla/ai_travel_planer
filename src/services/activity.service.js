import mongoose from "mongoose";
import slugify from "slugify";
import { Activity } from "../models/activity.models.js";
import { Destination } from "../models/destination.models.js";
import { ApiError } from "../utils/ApiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import {
    geoapifyClient,
    GEOAPIFY_API_KEY,
} from "../config/geoapify.js";

// Helper Functions

// Generate Activity Slug

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

// Upload Gallery Images

const uploadGalleryImages = async (
    galleryImages
) => {
    const uploadedImages = [];

    for (const image of galleryImages) {
        const uploaded =
            await uploadOnCloudinary(
                image.path,
                "ai-travel-planner/activities"
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

// Delete Gallery Images

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

// Create Activity

const createActivity = async ({
    activityData,
    coverImage,
    galleryImages = [],
}) => {
    // Verify Destination

    const destination =
        await Destination.findById(
            activityData.destination
        );

    if (!destination) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }

    // Generate Slug

    const slug = generateSlug(
        activityData.name,
        activityData.city,
        activityData.country
    );

    let uploadedCoverImage = null;
    let uploadedGalleryImages = [];

    try {
        // Upload Cover Image
      
        if (coverImage) {
            const response =
                await uploadOnCloudinary(
                    coverImage.path,
                    "ai-travel-planner/activities/cover"
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
                caption: activityData.name,
            };
        }

        // Upload Gallery Images
        
        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );
        }
        // Create Activity
        
        const activity =
            await Activity.create({
                ...activityData,
                slug,
                coverImage:
                    uploadedCoverImage,
                galleryImages:
                    uploadedGalleryImages,
            });

        return activity;
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

// Get All Activities

const getAllActivities = async ({
    page = 1,
    limit = 10,
    search = "",
    destination,
    city,
    country,
    category,
    difficulty,
    minRating,
    minPrice,
    maxPrice,
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

    if (category) {
        query.category = category;
    }

    if (difficulty) {
        query.difficulty = difficulty;
    }

    if (minRating) {
        query.averageRating = {
            $gte: Number(minRating),
        };
    }

    if (minPrice || maxPrice) {
        query.price = {};

        if (minPrice) {
            query.price.$gte =
                Number(minPrice);
        }

        if (maxPrice) {
            query.price.$lte =
                Number(maxPrice);
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
        case "priceLow":
            sortOption = {
                price: 1,
            };

            break;

        case "priceHigh":
            sortOption = {
                price: -1,
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

    const [activities, total] =
        await Promise.all([
            Activity.find(query)
                .select("-__v")
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate(
                    "destination",
                    "name city state country slug"
                )
                .lean(),

            Activity.countDocuments(query),
        ]);

    return {
        activities,
        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(total / limit),
        },
    };
};

// Get Activity By ID

const getActivityById = async (
    activityId
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            activityId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid activity ID."
        );
    }

    const activity =
        await Activity.findById(
            activityId
        )
            .select("-__v")
            .populate(
                "destination",
                "name city state country slug"
            )
            .lean();

    if (!activity) {
        throw new ApiError(
            404,
            "Activity not found."
        );
    }

    return activity;
};

// Search Activities

const searchActivities = async (
    keyword
) => {
    if (!keyword) {
        return [];
    }

    return await Activity.find({
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
                category: {
                    $regex: keyword,
                    $options: "i",
                },
            },
            {
                included: {
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

// Search Activities from Geoapify

const searchExternalActivities = async ({
    destinationId,
    category,
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

    const categories =
        category ||
        "tourism,tourism.sights,tourism.attraction";

    try {
        const response =
            await geoapifyClient.get(
                "/v2/places",
                {
                    params: {
                        categories,

                        filter:
                            `circle:${longitude},${latitude},10000`,

                        bias:
                            `proximity:${longitude},${latitude}`,

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
                        "Activity",

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

                    category:
                        properties.categories
                            ?.find((item) =>
                                item.startsWith(
                                    "tourism"
                                )
                            ) ||
                        "Sightseeing",

                    duration: 1,

                    durationUnit: "Hours",

                    price: 0,

                    currency: "INR",

                    difficulty: "Easy",

                    minimumAge: 0,

                    maximumAge: 100,

                    minimumParticipants: 1,

                    maximumParticipants: 20,

                    languages: [],

                    included: [],

                    excluded: [],

                    meetingPoint:
                        properties.formatted ||
                        "",

                    averageRating: 0,

                    reviewCount: 0,

                    coverImage: null,

                    galleryImages: [],

                    popularityScore: 0,

                    aiScore: 0,

                    isFeatured: false,

                    isActive: true,
                };
            })
            .filter(Boolean);

    } catch (error) {
        console.error(
            "Geoapify activity search error:",
            error.response?.data ||
                error.message
        );

        throw new ApiError(
            error.response?.status ||
                502,
            "Unable to fetch activities from Geoapify."
        );
    }
};

const saveExternalActivity = async ({
    activityData,
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
        category = "Sightseeing",
    } = activityData;

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
        await Activity.findOne({
            geoapifyPlaceId,
        });

    if (existing) {
        return existing;
    }

    const slug = slugify(
        `${name}-${city}-${country}`,
        {
            lower: true,
            strict: true,
        }
    );

    return await Activity.create({
        name,
        slug,
        description,
        destination,
        address,
        city,
        state,
        country,
        location,

        category,

        duration: 1,
        durationUnit: "Hours",

        price: 0,
        currency: "INR",

        difficulty: "Easy",

        minimumAge: 0,
        maximumAge: 100,

        minimumParticipants: 1,
        maximumParticipants: 20,

        included: [],
        excluded: [],
        languages: [],

        meetingPoint:
            address,

        averageRating: 0,
        reviewCount: 0,

        coverImage: null,
        galleryImages: [],

        popularityScore: 0,
        aiScore: 0,

        isFeatured: false,
        isActive: true,
    });
};

// Filter Activities

const filterActivities = async ({
    destination,
    city,
    country,
    category,
    difficulty,
    minPrice,
    maxPrice,
    minRating,
}) => {
    const query = {
        isActive: true,
    };

    if (destination) {
        query.destination = destination;
    }

    if (city) {
        query.city = city;
    }

    if (country) {
        query.country = country;
    }

    if (category) {
        query.category = category;
    }

    if (difficulty) {
        query.difficulty = difficulty;
    }

    if (minPrice || maxPrice) {
        query.price = {};

        if (minPrice) {
            query.price.$gte =
                Number(minPrice);
        }

        if (maxPrice) {
            query.price.$lte =
                Number(maxPrice);
        }
    }

    if (minRating) {
        query.averageRating = {
            $gte: Number(minRating),
        };
    }

    return await Activity.find(query)
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

// Update Activity

const updateActivity = async ({
    activityId,
    activityData,
    coverImage,
    galleryImages = [],
}) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            activityId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid activity ID."
        );
    }

    const activity =
        await Activity.findById(
            activityId
        );

    if (!activity) {
        throw new ApiError(
            404,
            "Activity not found."
        );
    }

    // Verify Destination (if changed)

    if (activityData.destination) {
        const destination =
            await Destination.findById(
                activityData.destination
            );

        if (!destination) {
            throw new ApiError(
                404,
                "Destination not found."
            );
        }

    }

    const oldCoverImage =
        activity.coverImage;

    const oldGalleryImages =
        activity.galleryImages;

    let uploadedCoverImage = null;
    let uploadedGalleryImages = [];

    try {
        // Upload Cover

        if (coverImage) {
            const response =
                await uploadOnCloudinary(
                    coverImage.path,
                    "ai-travel-planner/activities/cover"
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
                    activityData.name ||
                    activity.name,
            };

            activity.coverImage =
                uploadedCoverImage;
        }

        // Upload Gallery

        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );

            activity.galleryImages =
                uploadedGalleryImages;
        }

        // Update Fields

        Object.entries(activityData)
            .forEach(([key, value]) => {
                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    activity[key] = value;
                }
            });
        // Regenerate Slug

        if (
            activityData.name ||
            activityData.city ||
            activityData.country
        ) {
            activity.slug =
                generateSlug(
                    activityData.name ||
                        activity.name,

                    activityData.city ||
                        activity.city,

                    activityData.country ||
                        activity.country
                );
        }

        await activity.save();

        // Delete Old Cover

        if (
            coverImage &&
            oldCoverImage?.publicId
        ) {
            await deleteFromCloudinary(
                oldCoverImage.publicId
            );
        }

        // Delete Old Gallery

        if (
            galleryImages.length > 0
        ) {
            await deleteGalleryImages(
                oldGalleryImages
            );
        }

        return activity;
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

// Delete Activity

const deleteActivity = async (
    activityId
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            activityId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid activity ID."
        );
    }

    const activity =
        await Activity.findById(
            activityId
        );

    if (!activity) {
        throw new ApiError(
            404,
            "Activity not found."
        );
    }

    if (
        activity.coverImage?.publicId
    ) {
        await deleteFromCloudinary(
            activity.coverImage.publicId
        );
    }

    await deleteGalleryImages(
        activity.galleryImages
    );

    await activity.deleteOne();

    return true;
};

export const activityService = {
    createActivity,
    getAllActivities,
    getActivityById,
    searchActivities,
    searchExternalActivities,
    saveExternalActivity,
    filterActivities,
    updateActivity,
    deleteActivity,
};