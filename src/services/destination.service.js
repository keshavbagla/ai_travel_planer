import slugify from "slugify";
import { Destination } from "../models/destination.model.js";
import { findNearbyAirports } from "./airport.service.js";
import { ApiError } from "../utils/ApiError.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

import {
    geoapifyClient,
    GEOAPIFY_API_KEY,
} from "../config/geoapify.js";

const generateSlug = (name, city, country) => {
    return slugify(`${name}-${city}-${country}`, {
        lower: true,
        strict: true,
        trim: true,
    });
};

const uploadGalleryImages = async (files = []) => {
    const uploadedImages = [];

    for (const file of files) {
        const response = await uploadOnCloudinary(
            file.path,
            "ai-travel-planner/destinations"
        );

        if (!response) {
            throw new ApiError(
                500,
                "Failed to upload destination image."
            );
        }

        uploadedImages.push({
            url: response.secure_url,
            publicId: response.public_id,
            caption: "",
            isCover: false,
        });
    }

    return uploadedImages;
};

const deleteGalleryImages = async (images = []) => {
    for (const image of images) {
        if (image.publicId) {
            await deleteFromCloudinary(
                image.publicId
            );
        }
    }
};

const createDestination = async ({
    destinationData,
    coverImage,
    galleryImages = [],
}) => {

    const slug = generateSlug(
        destinationData.name,
        destinationData.city,
        destinationData.country
    );

    const existingDestination =
        await Destination.findOne({ slug });

    if (existingDestination) {
        throw new ApiError(
            409,
            "Destination already exists."
        );
    }

    let uploadedCoverImage = null;
    let uploadedGalleryImages = [];

    try {

        if (coverImage) {
            const response = await uploadOnCloudinary(
                coverImage.path,
                "ai-travel-planner/destinations/cover"
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
                caption: destinationData.name,
            };
        }

        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );
        }

        const destination =
            await Destination.create({
                ...destinationData,
                slug,
                coverImage: uploadedCoverImage,
                galleryImages: uploadedGalleryImages,
            });

        return destination;

    } catch (error) {

        if (uploadedCoverImage?.publicId) {
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

const getAllDestinations = async ({
    page = 1,
    limit = 10,
    search = "",
    country,
    state,
    city,
    destinationType,
    travelStyle,
    minRating,
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
                state: {
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
        ];
    }


    // Filters

    if (country) {
        query.country = country;
    }

    if (state) {
        query.state = state;
    }

    if (city) {
        query.city = city;
    }

    if (destinationType) {
        query.destinationType = destinationType;
    }

    if (travelStyle) {
        query.travelStyles = travelStyle;
    }

    if (minRating) {
        query.averageRating = {
            $gte: Number(minRating),
        };
    }

    if (isFeatured !== undefined) {
        query.isFeatured =
            isFeatured === "true";
    }

    let sortOption = {
        createdAt: -1,
    };

    switch (sort) {

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


    const [destinations, total] =
        await Promise.all([

            Destination.find(query)
                .select("-__v")
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean(),

            Destination.countDocuments(query),
        ]);


    return {
        destinations,

        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(total / limit),
        },
    };
};

const getDestinationById = async (
    destinationId
) => {

    const destination =
        await Destination.findById(
            destinationId
        )
            .select("-__v")
            .lean();

    if (!destination) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }

    return destination;
};

const searchLocalDestinations = async (
    keyword
) => {

    if (!keyword) {
        return [];
    }

    return await Destination.find({
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
                searchKeywords: {
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
        .sort({
            popularityScore: -1,
        })
        .limit(20)
        .lean();
};

const searchExternalDestinations = async (
    keyword,
    limit = 10
) => {

    if (!keyword?.trim()) {
        return [];
    }

    try {

        const response =
            await geoapifyClient.get(
                "/v1/geocode/search",
                {
                    params: {
                        text: keyword.trim(),

                        limit: Math.min(
                            Number(limit) || 10,
                            20
                        ),

                        lang: "en",

                        apiKey:
                            GEOAPIFY_API_KEY,
                    },
                }
            );


        const features =
            response.data?.features || [];


        return features
            .filter(
                (feature) =>
                    feature.geometry?.coordinates &&
                    feature.geometry.coordinates.length === 2
            )
            .map((feature) => {

                const properties =
                    feature.properties || {};

                const [
                    longitude,
                    latitude,
                ] =
                    feature.geometry.coordinates;


                return {

                    geoapifyPlaceId:
                        properties.place_id ||
                        null,

                    name:
                        properties.name ||
                        properties.city ||
                        properties.town ||
                        properties.village ||
                        properties.formatted ||
                        keyword,

                    city:
                        properties.city ||
                        properties.town ||
                        properties.village ||
                        "",

                    state:
                        properties.state ||
                        "",

                    country:
                        properties.country ||
                        "",

                    countryCode:
                        properties.country_code
                            ? properties.country_code.toUpperCase()
                            : "",

                    placeType:
                        properties.place_type ||
                        "",

                    location: {
                        type: "Point",

                        coordinates: [
                            longitude,
                            latitude,
                        ],
                    },

                    primaryAirportIata:
                        null,

                    formatted:
                        properties.formatted ||
                        "",
                };
            });

    } catch (error) {

        console.error(
            "Geoapify destination search failed:",
            error.response?.data ||
            error.message
        );

        throw new ApiError(
            502,
            "Failed to search destinations using Geoapify."
        );
    }
};

const searchDestinations = async (
    keyword,
    limit = 10
) => {

    const local =
        await searchLocalDestinations(
            keyword
        );

    if (local.length > 0) {

        return {
            source: "database",
            results: local,
        };
    }

    const external =
        await searchExternalDestinations(
            keyword,
            limit
        );


    return {
        source: "geoapify",
        results: external,
    };
};

const saveExternalDestination = async ({ destinationData }) => {
    const {
        geoapifyPlaceId,
        name,
        city,
        state,
        country,
        countryCode,
        placeType,
        location,
    } = destinationData;

    if (!geoapifyPlaceId) {
        throw new ApiError(
            400,
            "Geoapify place ID is required."
        );
    }

    if (!name) {
        throw new ApiError(
            400,
            "Destination name is required."
        );
    }

    if (!country) {
        throw new ApiError(
            400,
            "Country is required."
        );
    }

    if (
        !location?.coordinates ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
    ) {
        throw new ApiError(
            400,
            "Valid destination coordinates are required."
        );
    }

    const existingDestination = await Destination.findOne({
        geoapifyPlaceId,
    });

    if (existingDestination) {
        return existingDestination;
    }
    const [longitude, latitude] = location.coordinates;

    const airportData = await findNearbyAirports({
        latitude,
        longitude,
    });

    const slug = slugify(
        `${name}-${city || ""}-${country}`,
        {
            lower: true,
            strict: true,
        }
    );

    const destination = await Destination.create({
        name,
        city,
        state,
        country,
        countryCode,
        placeType,
        geoapifyPlaceId,

        primaryAirportIata:
            airportData.primaryAirportIata,

        nearbyAirports:
            airportData.nearbyAirports,

        location: {
            type: "Point",
            coordinates: [
                Number(longitude),
                Number(latitude),
            ],
        },

        slug,
        isActive: true,
    });

    return destination;
};

const filterDestinations = async ({
    country,
    destinationType,
    travelStyle,
    suitableFor,
    minBudget,
    maxBudget,
    minRating,
}) => {

    const query = {
        isActive: true,
    };


    if (country) {
        query.country = country;
    }


    if (destinationType) {
        query.destinationType =
            destinationType;
    }


    if (travelStyle) {
        query.travelStyles =
            travelStyle;
    }


    if (suitableFor) {
        query.suitableFor =
            suitableFor;
    }


    if (
        minBudget ||
        maxBudget
    ) {

        query[
            "averageDailyBudget.budget"
        ] = {};


        if (minBudget) {
            query[
                "averageDailyBudget.budget"
            ].$gte =
                Number(minBudget);
        }


        if (maxBudget) {
            query[
                "averageDailyBudget.budget"
            ].$lte =
                Number(maxBudget);
        }
    }


    if (minRating) {
        query.averageRating = {
            $gte: Number(minRating),
        };
    }


    return await Destination.find(
        query
    )
        .select("-__v")
        .sort({
            popularityScore: -1,
        })
        .lean();
};

const updateDestination = async ({
    destinationId,
    destinationData,
    coverImage,
    galleryImages = [],
}) => {

    const destination =
        await Destination.findById(
            destinationId
        );


    if (!destination) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }


    try {

        if (coverImage) {

            if (
                destination.coverImage?.publicId
            ) {
                await deleteFromCloudinary(
                    destination.coverImage.publicId
                );
            }


            const uploadedCover =
                await uploadOnCloudinary(
                    coverImage.path,
                    "ai-travel-planner/destinations/cover"
                );


            if (!uploadedCover) {
                throw new ApiError(
                    500,
                    "Failed to upload cover image."
                );
            }


            destination.coverImage = {
                url:
                    uploadedCover.secure_url,

                publicId:
                    uploadedCover.public_id,

                caption:
                    destinationData.name ||
                    destination.name,
            };
        }

        if (
            galleryImages.length > 0
        ) {

            await deleteGalleryImages(
                destination.galleryImages
            );


            destination.galleryImages =
                await uploadGalleryImages(
                    galleryImages
                );
        }

        Object.entries(
            destinationData
        ).forEach(([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                destination[key] = value;
            }
        });

        if (
            destinationData.name ||
            destinationData.city
        ) {

            destination.slug =
                generateSlug(

                    destinationData.name ||
                        destination.name,

                    destinationData.city ||
                        destination.city,

                    destinationData.country ||
                        destination.country
                );
        }


        await destination.save();

        return destination;

    } catch (error) {

        throw error;
    }
};

const deleteDestination = async (
    destinationId
) => {

    const destination =
        await Destination.findById(
            destinationId
        );


    if (!destination) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }

    if (
        destination.coverImage?.publicId
    ) {
        await deleteFromCloudinary(
            destination.coverImage.publicId
        );
    }

    await deleteGalleryImages(
        destination.galleryImages
    );

    await destination.deleteOne();

    return true;
};

export const destinationService = {
    createDestination,
    getDestinationById,
    getAllDestinations,
    updateDestination,
    deleteDestination,
    searchDestinations,
    filterDestinations,
    saveExternalDestination,
};