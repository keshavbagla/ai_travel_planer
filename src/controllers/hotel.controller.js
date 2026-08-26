import { hotelService } from "../services/hotel.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import {
    validateCreateHotel,
    validateUpdateHotel,
    validateHotelId
} from "../validators/hotel.validator.js";


const parseJSONField = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
};

const createHotel = asyncHandler(async (req, res) => {
    if (req.body.location) {
        req.body.location = parseJSONField(req.body.location);
    }

    if (req.body.amenities) {
        req.body.amenities = parseJSONField(req.body.amenities);
    }

    if (req.body.roomTypes) {
        req.body.roomTypes = parseJSONField(req.body.roomTypes);
    }

    validateCreateHotel(req.body);
    
    const coverImage =
        req.files?.coverImage?.[0];

    const galleryImages =
        req.files?.galleryImages || [];

    const hotel =
        await hotelService.createHotel({
            hotelData: req.body,
            coverImage,
            galleryImages,
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            hotel,
            "Hotel created successfully."
        )
    );
});


const getAllHotels = asyncHandler(async (req, res) => {
    const hotels =
        await hotelService.getAllHotels(req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            hotels,
            "Hotels fetched successfully."
        )
    );
});

const getHotelById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.hotelId)) {
        throw new ApiError(
            400,
            "Invalid hotel ID."
        );
    }

    const { hotelId } = req.params;

    validateHotelId(hotelId);

    const hotel =
        await hotelService.getHotelById(
            req.params.hotelId
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            hotel,
            "Hotel fetched successfully."
        )
    );
});

const searchHotels = asyncHandler(async (req, res) => {
    const hotels =
        await hotelService.searchHotels(
            req.query.keyword
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            hotels,
            "Search completed successfully."
        )
    );
});

const searchExternalHotels =
    asyncHandler(async (req, res) => {
        const {
            destinationId,
            checkIn,
            checkOut,
            adults = 2,
            limit = 10,
        } = req.query;

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

        const hotels =
            await hotelService.searchExternalHotels({
                destinationId,
                checkIn,
                checkOut,
                adults,
                limit,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                hotels,
                "Hotels fetched successfully from external API."
            )
        );
});

const saveExternalHotel =
    asyncHandler(async (req, res) => {
        const hotel =
            await hotelService.saveExternalHotel({
                hotelData: req.body,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                hotel,
                "Hotel selected successfully."
            )
        );
});

const getHotelBookingUrl =
    asyncHandler(async (req, res) => {

        const {
            hotelId,
        } = req.params;

        const booking =
            await hotelService
                .getHotelBookingUrl({
                    hotelId,
                });

        return res.status(200).json(
            new ApiResponse(
                200,
                booking,
                "Hotel booking URL fetched successfully."
            )
        );
});

const filterHotels = asyncHandler(async (req, res) => {
    const hotels =
        await hotelService.filterHotels(
            req.query
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            hotels,
            "Hotels filtered successfully."
        )
    );
});


const updateHotel = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.hotelId)) {
        throw new ApiError(
            400,
            "Invalid hotel ID."
        );
    }

    if (req.body.location) {
        req.body.location = parseJSONField(req.body.location);
    }

    if (req.body.amenities) {
        req.body.amenities = parseJSONField(req.body.amenities);
    }

    if (req.body.roomTypes) {
        req.body.roomTypes = parseJSONField(req.body.roomTypes);
    }

    const { hotelId } = req.params;

    validateHotelId(hotelId);

    validateUpdateHotel(req.body);

    const coverImage =
        req.files?.coverImage?.[0];

    const galleryImages =
        req.files?.galleryImages || [];

    const hotel =
        await hotelService.updateHotel({
            hotelId:
                req.params.hotelId,
            hotelData:
                req.body,
            coverImage,
            galleryImages,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            hotel,
            "Hotel updated successfully."
        )
    );
});

const deleteHotel = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.hotelId)) {
        throw new ApiError(
            400,
            "Invalid hotel ID."
        );
    }
    
    const { hotelId } = req.params;

    validateHotelId(hotelId);
    
    await hotelService.deleteHotel(
        req.params.hotelId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Hotel deleted successfully."
        )
    );
});

export {
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