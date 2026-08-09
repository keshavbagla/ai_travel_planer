import slugify from "slugify";
import { Hotel } from "../models/hotel.model.js";
import { Destination } from "../models/destinations.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

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

    const slug = generateSlug(
        hotelData.name,
        hotelData.city,
        hotelData.country
    );

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

        if (galleryImages.length > 0) {
            uploadedGalleryImages =
                await uploadGalleryImages(
                    galleryImages
                );
        }

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
        quey.isFeatured =
            isFeatured === "true";
    }

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
    filterHotels,
    updateHotel,
    deleteHotel,
};