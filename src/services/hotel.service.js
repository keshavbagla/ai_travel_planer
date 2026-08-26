import slugify from "slugify";
import { Hotel } from "../models/hotel.model.js";
import axios from "axios";
import { Destination } from "../models/destination.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const stayingApiClient = axios.create({
    baseURL:
        process.env.STAYING_BASE_URL ||
        "https://api.stayingapi.com",

    headers: {
        Authorization: `Bearer ${process.env.STAYING_API_KEY}`,
        "Content-Type": "application/json",
    },

    timeout: 15000,
});

const normalizeExternalHotel = ({
    hotel,
    destination,
}) => {
    const normalizeCoordinate = (
        value,
        reference,
        maxAbs
    ) => {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return null;
        }

        const candidates = [];

        for (let power = 0; power <= 18; power++) {
            const candidate =
                number /
                Math.pow(10, power);

            if (
                Math.abs(candidate) <= maxAbs
            ) {
                candidates.push(candidate);
            }
        }

        if (!candidates.length) {
            return null;
        }

        candidates.sort(
            (a, b) =>
                Math.abs(a - reference) -
                Math.abs(b - reference)
        );

        return candidates[0];
    };

    const latitude =
        normalizeCoordinate(
            hotel.location?.lat,
            destination.location.coordinates[1], 
            90
    );

    const longitude =
        normalizeCoordinate(
            hotel.location?.lng,
            destination.location.coordinates[0],
            180
    );

    if (
        latitude === null ||
        longitude === null ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new ApiError(
            502,
            "Invalid hotel coordinates returned by provider."
        );
    }

    const hotelTypeMap = {
        apartment: "Apartment",
        hotel: "Hotel",
        hostel: "Hostel",
        villa: "Villa",
        guesthouse: "Guest House",
        resort: "Resort",
    };

    return {
        name:
            hotel.name || "Hotel",

        destination:
            destination._id,

        address:
            hotel.location?.address || "",

        city:
            hotel.location?.city ||
            destination.city,

        state:
            hotel.location?.region || "",

        country:
            hotel.location?.country ||
            destination.country,

        location: {
            type: "Point",
            coordinates: [
                longitude,
                latitude,
            ],
        },

        hotelType:
            hotelTypeMap[
                String(
                    hotel.propertyType || ""
                ).toLowerCase()
            ] || "Hotel",

        starRating:
            Number(hotel.starRating) || 1,

        averageRating:
            Number(hotel.guestRating) || 0,

        reviewCount:
            Number(hotel.reviewCount) || 0,

        pricePerNight:
            Number(
                hotel.price?.nightlyPrice ??
                hotel.price?.nightly ??
                0
            ),

        currency:
            hotel.price?.currency ||
            "USD",

        amenities:
            Array.isArray(
                hotel.amenities
            )
                ? hotel.amenities
                : [],

        isActive: true,

        externalProvider:
            hotel.platform || "StayingAPI",

        externalHotelId:
            hotel.id || null,

        externalListingId:
            hotel.platformListingId ||
            null,
        images:
            Array.isArray(hotel.images)
                ? hotel.images
                : [],
        price: hotel.price
            ? (() => {

                const nightly =
                    Number(
                        hotel.price.nightly ??
                        hotel.price.nightlyPrice ??
                        0
                    );

                const nights =
                    Number(
                        hotel.price.nights ??
                        0
                    );

                const providerTotal =
                    Number(
                        hotel.price.total ??
                        0
                    );

                const taxes =
                    Number(
                        hotel.price.taxes ??
                        0
                    );

                const total =
                    providerTotal > 0
                        ? providerTotal
                        : nightly > 0 && nights > 0
                            ? nightly * nights + taxes
                            : 0;

                return {
                    nightly,

                    total,

                    currency:
                        hotel.price.currency ||
                        "USD",

                    nights,

                    taxes,
                };
            })()
            : null,        
            bookingUrl:
                hotel.url || null,
    };
};

// Generate Slug

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
            trim: true,
        }
    );
};

// Upload Gallery Images

const uploadGalleryImages = async (
    files = []
) => {
    const uploadedImages = [];

    for (const file of files) {
        const response =
            await uploadOnCloudinary(
                file.path,
                "ai-travel-planner/hotels"
            );

        if (!response) {
            throw new ApiError(
                500,
                "Failed to upload hotel image."
            );
        }

        uploadedImages.push({
            url: response.secure_url,
            publicId: response.public_id,
            caption: "",
        });
    }

    return uploadedImages;
};

// Delete Gallery Images

const deleteGalleryImages = async (
    images = []
) => {
    for (const image of images) {
        if (image.publicId) {
            await deleteFromCloudinary(
                image.publicId
            );
        }
    }
};

// Create Hotel

const createHotel = async ({
    hotelData,
    coverImage,
    galleryImages = [],
}) => {
    if (
      !mongoose.Types.ObjectId.isValid(
          hotelData.destination
      )
    ) {
      throw new ApiError(
          400,
          "Invalid destination ID."
      );
    }
    
    // Verify Destination
    
    if (hotelData.destination) {
        const destination = await Destination.findById(
            hotelData.destination
        );

        if (!destination) {
            throw new ApiError(
                404,
                "Destination not found."
            );
        }
    }

    // Generate Slug

    const slug = generateSlug(
        hotelData.name,
        hotelData.city,
        hotelData.country
    );

    // Duplicate Check

    const existingHotel =
        await Hotel.findOne({
            slug,
        });

    if (existingHotel) {
        throw new ApiError(
            409,
            "Hotel already exists."
        );
    }

    let uploadedCoverImage = null;
    let uploadedGalleryImages = [];

    try {
        // Upload Cover Image

        if (coverImage) {
            const response =
                await uploadOnCloudinary(
                    coverImage.path,
                    "ai-travel-planner/hotels/cover"
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
                caption: hotelData.name,
            };

        }

        // Upload Gallery Images

        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );
        }

        // Create Hotel

        const hotel =
            await Hotel.create({
                ...hotelData,
                slug,
                coverImage:
                    uploadedCoverImage,
                galleryImages:
                    uploadedGalleryImages,
            });

        return hotel;
    }
    catch (error) {
      // Rollback Cover Image
      
        if (
            uploadedCoverImage?.publicId
        ) {
            await deleteFromCloudinary(
                uploadedCoverImage.publicId
            );
        }

        // Rollback Gallery Images
        
        await deleteGalleryImages(
            uploadedGalleryImages
        );

        throw error;
    }
};

// Get All Hotels

const getAllHotels = async ({
    page = 1,
    limit = 10,
    search = "",
    destination,
    city,
    country,
    hotelType,
    starRating,
    minPrice,
    maxPrice,
    minRating,
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

    if (hotelType) {
        query.hotelType = hotelType;
    }

    if (starRating) {
        query.starRating = Number(starRating);
    }

    if (minRating) {
        query.averageRating = {
            $gte: Number(minRating),
        };
    }

    if (minPrice || maxPrice) {
        query.pricePerNight = {};

        if (minPrice) {
            query.pricePerNight.$gte =
                Number(minPrice);
        }

        if (maxPrice) {
            query.pricePerNight.$lte =
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
                pricePerNight: 1,
            };

            break;

        case "priceHigh":
            sortOption = {
                pricePerNight: -1,
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

    const [hotels, total] =
        await Promise.all([
            Hotel.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate(
                    "destination",
                    "name city state country slug"
                )
                .lean(),
            Hotel.countDocuments(query),
        ]);

    return {
        hotels,
        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(total / limit),
        },
    };
};

// Get Hotel By ID

const getHotelById = async (
    hotelId
) => {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(
          400,
          "Invalid hotel ID."
      );
    }

    const hotel =
        await Hotel.findById(hotelId)
            .populate(
                "destination",
                "name city state country slug"
            )
            .lean();

    if (!hotel) {
        throw new ApiError(
            404,
            "Hotel not found."
        );
    }

    return hotel;
};

// Search Hotels

const searchHotels = async (
    keyword
) => {
    if (!keyword) {
        return [];
    }

    return await Hotel.find({
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

const waitForStayingApiJob = async ({
    jobId,
    maxWaitMs = 5 * 60 * 1000,
    pollIntervalMs = 5000,
}) => {
    const startedAt = Date.now();

    while (
        Date.now() - startedAt <
        maxWaitMs
    ) {
        const response =
            await stayingApiClient.get(
                `/v1/jobs/${jobId}`
            );
        
        console.log(
            "StayingAPI job response:",
            JSON.stringify(
                response.data,
                null,
                2
            )
        );

        const job =
            response.data?.data;

        if (!job) {
            throw new ApiError(
                502,
                "Invalid StayingAPI job response."
            );
        }

        if (job.status === "completed") {
            return job.result;
        }

        if (
            job.status === "failed" ||
            job.status === "cancelled"
        ) {
            throw new ApiError(
                502,
                job.error ||
                    `StayingAPI job ${job.status}.`
            );
        }

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    pollIntervalMs
                )
        );
    }

    throw new ApiError(
        504,
        "Hotel search timed out."
    );
};

const searchExternalHotels = async ({
    destinationId,
    checkIn,
    checkOut,
    adults = 2,
    rooms = 1,
    limit = 20,
}) => {
    if (!destinationId) {
        throw new ApiError(
            400,
            "Destination ID is required."
        );
    }

    if (!checkIn || !checkOut) {
        throw new ApiError(
            400,
            "Check-in and check-out dates are required."
        );
    }

    const destination =
        await Destination.findOne({
            _id: destinationId,
            isActive: true,
        }).select(
            "name city country location"
        );

    if (!destination) {
        throw new ApiError(
            404,
            "Destination not found."
        );
    }

    const [
        longitude,
        latitude,
    ] =
        destination.location
            ?.coordinates || [];

    if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude)
    ) {
        throw new ApiError(
            400,
            "Destination coordinates are unavailable."
        );
    }

    try {
        console.log(
            "StayingAPI request:",
            {
                location:
                    `${destination.city}, ${destination.country}`,
                checkIn,
                checkOut,
                adults: Number(adults),
                children: 0,
                platforms: "booking",
                limit: Math.min(
                    Number(limit) || 20,
                    50
                ),
            }
        );

        const response =
            await stayingApiClient.get(
                "/v1/search",
                {
                    params: {
                        location:
                            `${destination.city}, ${destination.country}`,

                        checkIn,

                        checkOut,

                        adults:
                            Number(adults),

                        children: 0,

                        platforms:
                            "booking",

                        limit: Math.min(
                            Number(limit) || 20,
                            50
                        ),
                    },
                }
            );

        let providerResult;

        // -----------------------------------
        // Handle asynchronous StayingAPI job
        // -----------------------------------

        if (
            response.status === 202 &&
            response.data?.data?.jobId
        ) {
            providerResult =
                await waitForStayingApiJob({
                    jobId:
                        response.data.data.jobId,
                });

            console.log(
                "StayingAPI job completed."
            );
        }
        else {
            // Normal synchronous response
            providerResult =
                response.data;
        }

        // -----------------------------------
        // Debug provider response
        // -----------------------------------

        console.log(
            "FINAL PROVIDER RESULT:",
            JSON.stringify(
                providerResult,
                null,
                2
            )
        );

        // -----------------------------------
        // Extract hotels
        // -----------------------------------

        let hotels = [];

        if (
            Array.isArray(
                providerResult
            )
        ) {
            hotels =
                providerResult;
        }

        else if (
            Array.isArray(
                providerResult?.data
            )
        ) {
            hotels =
                providerResult.data;
        }

        else if (
            Array.isArray(
                providerResult?.hotels
            )
        ) {
            hotels =
                providerResult.hotels;
        }

        else if (
            Array.isArray(
                providerResult?.data?.hotels
            )
        ) {
            hotels =
                providerResult.data.hotels;
        }

        else if (
            Array.isArray(
                providerResult?.data?.data
            )
        ) {
            hotels =
                providerResult.data.data;
        }

        console.log(
            "FINAL EXTRACTED HOTEL COUNT:",
            hotels.length
        );

        // -----------------------------------
        // Metadata
        // -----------------------------------

        const meta =
            providerResult?.meta ||
            providerResult?.data?.meta ||
            {};

        // -----------------------------------
        // No hotels
        // -----------------------------------

        if (!hotels.length) {
            return {
                hotels: [],
                meta,
                message:
                    "No hotels found for the selected destination and dates.",
            };
        }

        // -----------------------------------
        // Normalize hotels
        // -----------------------------------

        const normalizedHotels =
            hotels.map((hotel) => {
                const normalized =
                    normalizeExternalHotel({
                        hotel,
                        destination,
                    });

                return {
                    ...normalized,

                    externalId:
                        hotel.id || null,

                    platform:
                        hotel.platform || null,

                    platformListingId:
                        hotel.platformListingId ||
                        null,

                    bookingUrl:
                        hotel.url || null,

                    images:
                        Array.isArray(
                            hotel.images
                        )
                            ? hotel.images
                            : [],

                    source:
                        "StayingAPI",
                };
            });

        // -----------------------------------
        // Final response
        // -----------------------------------

        return {
            hotels:
                normalizedHotels,

            meta,

            message:
                "Hotels fetched successfully from StayingAPI.",
        };

    }
    catch (error) {

        console.error(
            "StayingAPI hotel search error:",
            error.response?.data ||
                error.message
        );

        throw new ApiError(
            error.response?.status ||
                502,

            "Unable to fetch hotels from StayingAPI."
        );
    }
};

const saveExternalHotel = async ({
    hotelData,
}) => {
    const {
        externalProvider,
        externalHotelId,
        externalListingId,
        bookingUrl,
        name,
        destination,
        address = "",
        city = "",
        state = "",
        country = "",
        location,
        hotelType = "Hotel",
        starRating = 1,
        averageRating = 0,
        reviewCount = 0,
        pricePerNight = 0,
        currency = "EUR",
        amenities = [],
    } = hotelData;

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

    if (!externalHotelId) {
        throw new ApiError(
            400,
            "External hotel ID is required."
        );
    }

    const existing =
        await Hotel.findOne({
            externalProvider,
            externalHotelId,
        });

    if (existing) {
        return existing;
    }

    const slug = generateSlug(
        name,
        city,
        country
    );

    const hotel =
        await Hotel.create({
            name,
            slug,

            destination,

            address,
            city,
            state,
            country,

            location,

            hotelType,

            starRating:
                Math.min(
                    Math.max(
                        Number(starRating) || 1,
                        1
                    ),
                    5
                ),

            averageRating:
                Number(averageRating) || 0,

            reviewCount:
                Number(reviewCount) || 0,

            pricePerNight:
                Number(pricePerNight) || 0,

            currency,

            amenities,

            externalProvider,

            externalHotelId,

            externalListingId:
                externalListingId || null,

            bookingUrl:
                bookingUrl || null,

            isActive: true,
        });

    return hotel;
};

// Get Hotel Booking URL

const getHotelBookingUrl = async ({
    hotelId,
}) => {

    if (
        !mongoose.Types.ObjectId.isValid(
            hotelId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid hotel ID."
        );
    }

    const hotel =
        await Hotel.findOne({
            _id: hotelId,
            isActive: true,
        }).lean();

    if (!hotel) {
        throw new ApiError(
            404,
            "Hotel not found."
        );
    }

    if (
        !hotel.bookingUrl
    ) {
        throw new ApiError(
            404,
            "Booking URL is not available for this hotel."
        );
    }

    if (
        !hotel.externalProvider
    ) {
        throw new ApiError(
            400,
            "External booking provider is not configured for this hotel."
        );
    }

    return {
        hotelId: hotel._id,

        provider:
            hotel.externalProvider,

        externalHotelId:
            hotel.externalHotelId,

        externalListingId:
            hotel.externalListingId,

        bookingUrl:
            hotel.bookingUrl,
    };
};

// Filter Hotels

const filterHotels = async ({
    destination,
    city,
    country,
    hotelType,
    starRating,
    amenities,
    minPrice,
    maxPrice,
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

    if (hotelType) {
        query.hotelType =
            hotelType;
    }

    if (starRating) {
        query.starRating =
            Number(starRating);
    }

    if (amenities) {
        const amenityList =
            amenities
                .split(",")
                .map((item) =>
                    item.trim()
                );

        query.amenities = {
            $all: amenityList,
        };
    }

    if (
        minPrice ||
        maxPrice
    ) {
        query.pricePerNight = {};

        if (minPrice) {
            query.pricePerNight.$gte =
                Number(minPrice);
        }

        if (maxPrice) {
            query.pricePerNight.$lte =
                Number(maxPrice);
        }
    }

    if (minRating) {
        query.averageRating = {
            $gte:
                Number(minRating),
        };
    }

    return await Hotel.find(query)
        .populate(
            "destination",
            "name city state country slug"
        )
        .sort({
            popularityScore: -1,
        })
        .lean();
};

// Update Hotel

const updateHotel = async ({
    hotelId,
    hotelData,
    coverImage,
    galleryImages = [],
}) => {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new ApiError(
            400,
            "Invalid hotel ID."
        );
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
        throw new ApiError(
            404,
            "Hotel not found."
        );
    }

    // Verify Destination (if changed)

    if (hotelData.destination) {
        const destination = await Destination.findById(
            hotelData.destination
        );

        if (!destination) {
            throw new ApiError(
                404,
                "Destination not found."
            );
        }
    }

    const oldCoverImage =
        hotel.coverImage;

    const oldGalleryImages =
        hotel.galleryImages;

    let uploadedCoverImage = null;
    let uploadedGalleryImages = [];

    try {
        // Upload New Cover Image

        if (coverImage) {
            const response =
                await uploadOnCloudinary(
                    coverImage.path,
                    "ai-travel-planner/hotels/cover"
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
                    hotelData.name ||
                    hotel.name,
            };

            hotel.coverImage =
                uploadedCoverImage;
        }

        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );

            hotel.galleryImages =
                uploadedGalleryImages;
        }

        Object.entries(hotelData).forEach(
            ([key, value]) => {
                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    hotel[key] = value;
                }
            }
        );

        if (
            hotelData.name ||
            hotelData.city ||
            hotelData.country
        ) {
            hotel.slug = generateSlug(
                hotelData.name ||
                    hotel.name,
                hotelData.city ||
                    hotel.city,
                hotelData.country ||
                    hotel.country
            );
        }

        await hotel.save();

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

        return hotel;
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

const deleteHotel = async (
    hotelId
) => {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new ApiError(
            400,
            "Invalid hotel ID."
        );
    }

    const hotel =
        await Hotel.findById(
            hotelId
        );

    if (!hotel) {
        throw new ApiError(
            404,
            "Hotel not found."
        );
    }

    if (
        hotel.coverImage?.publicId
    ) {
        await deleteFromCloudinary(
            hotel.coverImage.publicId
        );
    }

    await deleteGalleryImages(
        hotel.galleryImages
    );

    await hotel.deleteOne();

    return true;
};

export const hotelService = {
    createHotel,
    getAllHotels,
    getHotelById,
    searchHotels,
    searchExternalHotels,
    saveExternalHotel,
    getHotelBookingUrl,
    filterHotels,
    updateHotel,
    deleteHotel,
};