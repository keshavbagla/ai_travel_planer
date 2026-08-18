import slugify from "slugify";
import mongoose from "mongoose";

import { Hotel } from "../models/hotel.model.js";
import { Destination } from "../models/destinations.model.js";
import { ApiError } from "../utils/ApiError.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

import {
    searchHotelsExternal,
    searchHotelsByCoordinates,
    getHotelFilter,
    getHotelDetailsExternal,
    getRoomAvailability,
    getRoomList,
    getRoomListWithAvailability,
    getHotelPhotos,

    liteApiPrebook,
    liteApiBook,
    liteApiGetBooking,
    liteApiCancelBooking,
} from "../integrations/hotel.integration.js";

const confirmHotelBooking = async ({
    hotelId,
    bookingId,
    bookingData,
}) => {

    const result =
        await liteApiBook(bookingData);

    const hotel =
        await Hotel.findById(hotelId);

    if (!hotel) {
        throw new ApiError(
            404,
            "Hotel not found."
        );
    }

    const booking =
        hotel.bookings.id(bookingId);

    if (!booking) {
        throw new ApiError(
            404,
            "Booking not found."
        );
    }

    booking.status = "CONFIRMED";

    booking.bookingResponse = result;

    booking.providerBookingId =
        result?.data?.bookingId ||
        result?.bookingId ||
        "";

    await hotel.save();

    return booking;
};


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

const searchExternalHotels = async (data) => {
    return await searchHotelsExternal(data);
};

const searchExternalHotelsByCoordinates = async (data) => {
    return await searchHotelsByCoordinates(data);
};

const getExternalHotelFilter = async (data) => {
    return await getHotelFilter(data);
};

const getExternalHotelDetails = async (data) => {
    return await getHotelDetailsExternal(data);
};

const getExternalRoomAvailability = async (data) => {
    return await getRoomAvailability(data);
};

const getExternalRoomList = async (data) => {
    return await getRoomList(data);
};

const getExternalRoomListWithAvailability = async (data) => {
    return await getRoomListWithAvailability(data);
};

const getExternalHotelPhotos = async (data) => {
    return await getHotelPhotos(data);
};
const prebookHotel = async ({
    userId,
    hotelId,
    offerId,
    usePaymentSdk = false,
    hotelName = "",
    checkIn,
    checkOut,
    currency = "USD",
}) => {

    if (!userId) {

        throw new ApiError(
            401,
            "User authentication required."
        );
    }


    if (!hotelId) {

        throw new ApiError(
            400,
            "hotelId is required."
        );
    }


    if (!offerId) {

        throw new ApiError(
            400,
            "offerId is required."
        );
    }


    const hotel =
        await Hotel.findById(hotelId);


    if (!hotel) {

        throw new ApiError(
            404,
            "Hotel not found."
        );
    }


    const result =
        await liteApiPrebook({

            offerId,

            usePaymentSdk,
        });


    const prebookId =
        result?.data?.prebookId ||
        result?.prebookId ||
        "";


    if (!prebookId) {

        throw new ApiError(
            502,
            "LiteAPI did not return a prebookId."
        );
    }


    // Add booking directly inside Hotel
    hotel.bookings.push({

        user: userId,

        provider: "liteapi",

        hotelId: String(hotelId),

        hotelName:
            hotelName ||
            hotel.name,

        offerId,

        prebookId,

        checkIn,

        checkOut,

        currency,

        status: "PREBOOKED",

        prebookResponse: result,
    });


    await hotel.save();


    const booking =
        hotel.bookings[
            hotel.bookings.length - 1
        ];


    return {

        booking,

        liteApi: result,
    };
};


const bookHotel = async ({
    userId,
    hotelId,
    bookingId,
    bookingData,
}) => {

    if (!userId) {

        throw new ApiError(
            401,
            "User authentication required."
        );
    }


    const hotel =
        await Hotel.findById(hotelId);


    if (!hotel) {

        throw new ApiError(
            404,
            "Hotel not found."
        );
    }


    const booking =
        hotel.bookings.id(bookingId);


    if (!booking) {

        throw new ApiError(
            404,
            "Booking not found."
        );
    }


    if (
        booking.user.toString() !==
        userId.toString()
    ) {

        throw new ApiError(
            403,
            "You are not allowed to access this booking."
        );
    }


    if (!booking.prebookId) {

        throw new ApiError(
            400,
            "Prebook ID is missing."
        );
    }


    const result =
        await liteApiBook({

            ...bookingData,

            prebookId:
                booking.prebookId,
        });


    booking.status =
        "CONFIRMED";


    booking.bookingResponse =
        result;


    booking.providerBookingId =
        result?.data?.bookingId ||
        result?.bookingId ||
        result?.data?.id ||
        "";


    if (
        bookingData?.holder
    ) {

        booking.holder =
            bookingData.holder;
    }


    if (
        bookingData?.guests
    ) {

        booking.guests =
            bookingData.guests;
    }


    await hotel.save();


    return {

        booking,

        liteApi:
            result,
    };
};


const getHotelBooking = async ({
    userId,
    hotelId,
    bookingId,
}) => {

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


    const booking =
        hotel.bookings.id(
            bookingId
        );


    if (!booking) {

        throw new ApiError(
            404,
            "Booking not found."
        );
    }


    if (
        booking.user.toString() !==
        userId.toString()
    ) {

        throw new ApiError(
            403,
            "You are not allowed to access this booking."
        );
    }

    if (
        booking.providerBookingId
    ) {

        const result =
            await liteApiGetBooking(
                booking.providerBookingId
            );


        booking.bookingResponse =
            result;


        await hotel.save();
    }


    return booking;
};

const getUserHotelBookings =
    async (userId) => {

        const hotels =
            await Hotel.find({

                "bookings.user":
                    userId,

            })
            .select(
                "name city country coverImage bookings"
            )
            .lean();


        const bookings = [];


        for (
            const hotel of hotels
        ) {

            const userBookings =
                hotel.bookings.filter(
                    (booking) =>
                        booking.user.toString() ===
                        userId.toString()
                );


            for (
                const booking of userBookings
            ) {

                bookings.push({

                    ...booking,

                    hotel: {

                        _id:
                            hotel._id,

                        name:
                            hotel.name,

                        city:
                            hotel.city,

                        country:
                            hotel.country,

                        coverImage:
                            hotel.coverImage,
                    },
                });
            }
        }


        return bookings;
    };

const cancelHotelBooking =
    async ({
        userId,
        hotelId,
        bookingId,
    }) => {

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


        const booking =
            hotel.bookings.id(
                bookingId
            );


        if (!booking) {

            throw new ApiError(
                404,
                "Booking not found."
            );
        }


        if (
            booking.user.toString() !==
            userId.toString()
        ) {

            throw new ApiError(
                403,
                "You are not allowed to cancel this booking."
            );
        }


        if (
            !booking.providerBookingId
        ) {

            throw new ApiError(
                400,
                "Provider booking ID not found."
            );
        }


        const result =
            await liteApiCancelBooking(
                booking.providerBookingId
            );


        booking.status =
            "CANCELLED";


        booking.cancellation.status =
            "CANCELLED";


        booking.cancellation.cancelledAt =
            new Date();


        booking.cancellationResponse =
            result;


        await hotel.save();


        return {

            booking,

            liteApi:
                result,
        };
    };

export const hotelService = {
    // Local hotels
    createHotel,
    getAllHotels,
    getHotelById,
    searchHotels,
    filterHotels,
    updateHotel,
    deleteHotel,
    // External hotel APIs
    searchExternalHotels,
    searchExternalHotelsByCoordinates,
    getExternalHotelFilter,
    getExternalHotelDetails,
    getExternalRoomAvailability,
    getExternalRoomList,
    getExternalRoomListWithAvailability,
    getExternalHotelPhotos,
    // Hotel booking
    prebookHotel,
    bookHotel,
    getHotelBooking,
    getUserHotelBookings,
    cancelHotelBooking,
};