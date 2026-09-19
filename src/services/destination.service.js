import slugify from "slugify";
import { Destination } from "../models/destination.model.js";
import { findNearbyAirports } from "./airport.service.js";
import { ApiError } from "../utils/ApiError.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

import {
    openTripMapClient,
    OPENTRIPMAP_API_KEY,
} from "../config/opentripmap.js";

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

const buildDestinationDescription = (destination) => {
    if (destination.description?.trim()) return destination.description;

    const name = destination.name || "This destination";
    const types = (destination.destinationType || []).join(", ").toLowerCase();
    const places = (destination.placesToVisit || []).slice(0, 8).join(", ");
    const activities = (destination.popularActivities || []).slice(0, 8).join(", ");
    const beaches = (destination.beaches || []).slice(0, 6).join(", ");
    const famousFor = (destination.famousFor || []).slice(0, 8).join(", ");
    const shopping = (destination.shopping || []).slice(0, 6).join(", ");

    return [
      name + (types ? ` is a ${types} destination known for its distinctive travel experiences.` : " is a popular destination for travelers."),
      places ? `Places to visit include ${places}.` : "Explore the destination's major attractions, local neighborhoods and cultural landmarks.",
      activities ? `Popular activities include ${activities}.` : "Visitors can combine sightseeing, local experiences and outdoor activities according to their trip style.",
      beaches ? `Notable beaches or coastal areas include ${beaches}.` : "The surrounding natural scenery can be explored through day trips and outdoor experiences.",
      famousFor ? `The destination is especially famous for ${famousFor}.` : "Local food, culture and scenery are important parts of the experience.",
      shopping ? `For shopping, travelers can explore ${shopping}.` : "Local markets and shopping areas are useful for souvenirs and regional products.",
      "Travelers can choose accommodation and dining based on their budget, location and preferred travel style.",
      "The destination can be filtered by season, region, budget tier and trip type in the travel planner."
    ].join(" ");
};

const normalizeDestination = (destination) => {
    const item = { ...destination };
    item.id = item._id?.toString?.() || item.id || item.geoapifyPlaceId || item.slug;
    delete item._id;
    item.description = buildDestinationDescription(item);
    item.placesToVisit = item.placesToVisit || [];
    item.activities = item.activities || item.popularActivities || [];
    item.hotels = item.hotels || [];
    item.restaurants = item.restaurants || [];
    item.nightlife = item.nightlife || [];
    item.beaches = item.beaches || [];
    item.shopping = item.shopping || [];
    item.famousFor = item.famousFor || [];
    return item;
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

const classifyDestination = ({ name = "", kinds = "", nearbyNames = [] }) => {
    const source = `${name} ${kinds} ${nearbyNames.join(" ")}`.toLowerCase();
    const types = [];

    if (/beach|coast|seaside|marine/.test(source)) types.push("Beach");
    if (/mountain|hill|peak|alpine|cliff/.test(source)) types.push("Mountain");
    if (/city|urban/.test(source) || types.length === 0) types.push("City");
    if (/adventure|sport|amusement|theme_park/.test(source)) types.push("Adventure");
    if (/wildlife|zoo|safari/.test(source)) types.push("Wildlife");
    if (/desert|dune/.test(source)) types.push("Desert");
    if (/forest|wood|jungle/.test(source)) types.push("Forest");
    if (/island/.test(source)) types.push("Island");
    if (/snow|ski|glacier/.test(source)) types.push("Snow");
    if (/religious|church|temple|mosque|shrine/.test(source)) types.push("Religious");
    if (/historic|history|castle|fort|monument|archaeological/.test(source)) types.push("Historical");
    if (/nature|natural|park|waterfall|lake|garden/.test(source)) types.push("Nature");

    return [...new Set(types)].slice(0, 4);
};

const classifySeasons = ({ latitude, kinds = "" }) => {
    const absLat = Math.abs(Number(latitude) || 0);
    const source = kinds.toLowerCase();

    if (absLat < 25) {
        if (/beach|coast|island|marine/.test(source)) {
            return ["winter", "summer"];
        }
        return ["winter", "summer", "monsoon"];
    }

    if (absLat < 45) {
        if (/mountain|snow|ski/.test(source)) {
            return ["summer", "winter"];
        }
        return ["spring", "summer", "autumn", "winter"];
    }

    return ["summer", "autumn", "winter"];
};

const buildOpenTripMapDestination = ({
    place,
    nearby = [],
    requestedName,
}) => {
    const nearbyNames = nearby
        .map((item) => item.name)
        .filter(Boolean)
        .slice(0, 12);

    const kinds = [
        place.kinds || "",
        ...nearby.map((item) => item.kinds || ""),
    ].join(",");

    const destinationTypes = classifyDestination({
        name: place.name || requestedName,
        kinds,
        nearbyNames,
    });

    const placesToVisit = nearbyNames.slice(0, 8);

    const beaches = nearby
        .filter((item) => /beach|coast|seaside|marine/i.test(item.kinds || ""))
        .map((item) => item.name)
        .filter(Boolean)
        .slice(0, 6);

    const famousFor = [...destinationTypes, ...beaches.map(() => "local attractions")]
        .filter(Boolean)
        .slice(0, 8);

    const description =
        place.info?.descr ||
        `${place.name || requestedName} is a destination identified through OpenTripMap place data. It can be explored through nearby attractions and activities, with destination type and season suggestions derived from available place categories and location.`;

    return {
        openTripMapXid: place.xid || null,
        name: place.name || requestedName,
        city: place.name || requestedName,
        state: "",
        country: place.country || "",
        countryCode: place.country_code
            ? String(place.country_code).toUpperCase()
            : "",
        placeType: place.kinds || "",
        location: {
            type: "Point",
            coordinates: [
                Number(place.lon),
                Number(place.lat),
            ],
        },
        description,
        destinationType: destinationTypes,
        seasons: classifySeasons({
            latitude: place.lat,
            kinds,
        }),
        placesToVisit,
        beaches,
        famousFor,
        popularActivities: destinationTypes.includes("Beach")
            ? ["Beach activities", "Sightseeing", "Local experiences"]
            : ["Sightseeing", "Local experiences", "Outdoor activities"],
        searchKeywords: [
            requestedName,
            place.name,
            ...nearbyNames,
        ].filter(Boolean),
    };
};

const searchExternalDestinations = async (
    keyword,
    limit = 10
) => {
    if (!keyword?.trim()) return [];

    try {
        const geonameResponse = await openTripMapClient.get(
            "/0.1/en/places/geoname",
            {
                params: {
                    name: keyword.trim(),
                    apikey: OPENTRIPMAP_API_KEY,
                },
            }
        );

        const place = geonameResponse.data;

        if (!place?.lat || !place?.lon) {
            return [];
        }

        let nearby = [];

        try {
            const radiusResponse = await openTripMapClient.get(
                "/0.1/en/places/radius",
                {
                    params: {
                        radius: 50000,
                        lon: place.lon,
                        lat: place.lat,
                        limit: Math.min(Number(limit) || 10, 20),
                        rate: 2,
                        format: "json",
                        apikey: OPENTRIPMAP_API_KEY,
                    },
                }
            );

            nearby = Array.isArray(radiusResponse.data)
                ? radiusResponse.data
                : [];
        } catch (nearbyError) {
            console.error(
                "OpenTripMap nearby search failed:",
                nearbyError.response?.data || nearbyError.message
            );
        }

        const result = buildOpenTripMapDestination({
            place,
            nearby,
            requestedName: keyword.trim(),
        });

        return [result];
    } catch (error) {
        console.error(
            "OpenTripMap destination search failed:",
            error.response?.data || error.message
        );

        throw new ApiError(
            502,
            "Failed to search destinations using OpenTripMap."
        );
    }
};
const searchDestinations = async (keyword, limit = 10, filters = {}) => {
    const { region, budgetTier, season, tripType } = filters;
    const query = { isActive: true };
    const text = keyword?.trim();
    const andConditions = [];

    if (text) {
      andConditions.push({
        $or: [
          { name: { $regex: text, $options: "i" } },
          { city: { $regex: text, $options: "i" } },
          { state: { $regex: text, $options: "i" } },
          { country: { $regex: text, $options: "i" } },
          { searchKeywords: { $in: [new RegExp(text, "i")] } },
        ],
      });
    }
    if (region) query.region = { $regex: region, $options: "i" };
    if (budgetTier) query.budgetTier = { $regex: budgetTier, $options: "i" };
    if (season) query.seasons = season.toLowerCase();
    if (tripType) {
      const normalized = String(tripType).trim();
      andConditions.push({
        $or: [
          { travelStyles: normalized },
          { suitableFor: normalized },
          { destinationType: normalized },
        ],
      });
    }
    if (andConditions.length) query.$and = andConditions;

    const local = await Destination.find(query)
      .select("-__v")
      .sort({ popularityScore: -1, averageRating: -1, name: 1 })
      .limit(Math.min(Number(limit) || 10, 30))
      .lean();

    if (local.length > 0) {
      return { source: "database", results: local.map(normalizeDestination) };
    }

    if (Object.keys(filters).some((key) => filters[key])) {
      return { source: "database", results: [] };
    }

    const external = await searchExternalDestinations(keyword, limit);
    return { source: "geoapify", results: external.map(normalizeDestination) };
};

const saveExternalDestination = async ({ destinationData }) => {
    const {
        openTripMapXid,
        name,
        city,
        country,
        countryCode,
        location,
        ...rest
    } = destinationData;

    if (!openTripMapXid) {
        throw new ApiError(
            400,
            "OpenTripMap XID is required."
        );
    }

    if (!name || !country) {
        throw new ApiError(
            400,
            "Destination name and country are required."
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
        openTripMapXid,
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

    return await Destination.create({
        ...rest,
        openTripMapXid,
        name,
        city: city || name,
        country,
        countryCode,
        location: {
            type: "Point",
            coordinates: [
                Number(longitude),
                Number(latitude),
            ],
        },
        primaryAirportIata: airportData.primaryAirportIata,
        nearbyAirports: airportData.nearbyAirports,
        slug,
        isActive: true,
    });
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