import { hotelService } from "../services/hotel.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import mongoose from "mongoose";

import {
    validateCreateHotel,
    validateUpdateHotel,
    validateHotelId,
} from "../validators/hotel.validator.js";


const confirmHotelBooking =
    asyncHandler(async (req, res) => {

        const result =
            await hotelService.confirmHotelBooking({
                hotelId:
                    req.body.hotelId,

                bookingId:
                    req.params.bookingId,

                bookingData:
                    req.body.bookingData,
            });

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Hotel booking confirmed successfully."
            )
        );
    });

const parseJSONField = (value) => {

    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const createHotel = asyncHandler(
    async (req, res) => {

        if (req.body.location) {
            req.body.location =
                parseJSONField(req.body.location);
        }

        if (req.body.amenities) {
            req.body.amenities =
                parseJSONField(req.body.amenities);
        }

        if (req.body.roomTypes) {
            req.body.roomTypes =
                parseJSONField(req.body.roomTypes);
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
    }
);


const getAllHotels = asyncHandler(
    async (req, res) => {

        const hotels =
            await hotelService.getAllHotels(
                req.query
            );


        return res.status(200).json(
            new ApiResponse(
                200,
                hotels,
                "Hotels fetched successfully."
            )
        );
    }
);


const getHotelById = asyncHandler(
    async (req, res) => {

        const { hotelId } =
            req.params;


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


        validateHotelId(hotelId);


        const hotel =
            await hotelService.getHotelById(
                hotelId
            );


        return res.status(200).json(
            new ApiResponse(
                200,
                hotel,
                "Hotel fetched successfully."
            )
        );
    }
);


const searchHotels = asyncHandler(
    async (req, res) => {

        const hotels =
            await hotelService.searchHotels(
                req.query.keyword
            );


        return res.status(200).json(
            new ApiResponse(
                200,
                hotels,
                "Hotel search completed successfully."
            )
        );
    }
);


const filterHotels = asyncHandler(
    async (req, res) => {

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
    }
);


const updateHotel = asyncHandler(
    async (req, res) => {

        const { hotelId } =
            req.params;


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


        if (req.body.location) {
            req.body.location =
                parseJSONField(
                    req.body.location
                );
        }

        if (req.body.amenities) {
            req.body.amenities =
                parseJSONField(
                    req.body.amenities
                );
        }

        if (req.body.roomTypes) {
            req.body.roomTypes =
                parseJSONField(
                    req.body.roomTypes
                );
        }


        validateHotelId(hotelId);

        validateUpdateHotel(req.body);


        const coverImage =
            req.files?.coverImage?.[0];

        const galleryImages =
            req.files?.galleryImages || [];


        const hotel =
            await hotelService.updateHotel({

                hotelId,

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
    }
);


const deleteHotel = asyncHandler(
    async (req, res) => {

        const { hotelId } =
            req.params;


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


        validateHotelId(hotelId);


        await hotelService.deleteHotel(
            hotelId
        );


        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Hotel deleted successfully."
            )
        );
    }
);


const externalHotelSearch =
    asyncHandler(
        async (req, res) => {

            console.log(
                "🔥 EXTERNAL HOTEL SEARCH"
            );

            console.log(
                "QUERY:",
                req.query
            );


            const result =
                await hotelService
                    .searchExternalHotels(
                        req.query
                    );


            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "External hotels fetched successfully."
                )
            );
        }
    );


const externalHotelSearchCoordinates =
    asyncHandler(
        async (req, res) => {

            console.log(
                "🔥 HOTEL SEARCH BY COORDINATES"
            );

            console.log(
                "QUERY:",
                req.query
            );


            const result =
                await hotelService
                    .searchExternalHotelsByCoordinates(
                        req.query
                    );


            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "Hotels fetched by coordinates successfully."
                )
            );
        }
    );

const externalHotelFilter = 
    asyncHandler(
        async (req, res) => {
            const params = {
                ...req.query,
                ...req.body,
            };

            console.log(
                "🔥 EXTERNAL HOTEL FILTER"
            );

            console.log(
                "PARAMS:",
                params
            );


            const result =
                await hotelService
                    .getExternalHotelFilter(
                        params
                    )
        }
    );


const externalHotelDetails =
    asyncHandler(
        async (req, res) => {

            console.log(
                "🔥 EXTERNAL HOTEL DETAILS"
            );

            console.log(
                "QUERY:",
                req.query
            );


            const result =
                await hotelService
                    .getExternalHotelDetails(
                        req.query
                    );


            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "Hotel details fetched successfully."
                )
            );
        }
    );

const externalRoomAvailability =
    asyncHandler(
        async (req, res) => {

            console.log(
                "🔥 ROOM AVAILABILITY"
            );

            console.log(
                "QUERY:",
                req.query
            );


            const result =
                await hotelService
                    .getExternalRoomAvailability(
                        req.query
                    );


            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "Room availability fetched successfully."
                )
            );
        }
    );

const externalRoomList =
    asyncHandler(
        async (req, res) => {

            console.log(
                "🔥 ROOM LIST"
            );

            console.log(
                "QUERY:",
                req.query
            );


            const result =
                await hotelService
                    .getExternalRoomList(
                        req.query
                    );


            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "Room list fetched successfully."
                )
            );
        }
    );

const externalRoomListAvailability =
    asyncHandler(
        async (req, res) => {

            console.log(
                "🔥 ROOM LIST + AVAILABILITY"
            );

            console.log(
                "QUERY:",
                req.query
            );


            const result =
                await hotelService
                    .getExternalRoomListWithAvailability(
                        req.query
                    );


            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "Available rooms fetched successfully."
                )
            );
        }
    );



const externalHotelPhotos =
    asyncHandler(
        async (req, res) => {

            console.log(
                "🔥 HOTEL PHOTOS"
            );

            console.log(
                "QUERY:",
                req.query
            );


            const result =
                await hotelService
                    .getExternalHotelPhotos(
                        req.query
                    );


            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "Hotel photos fetched successfully."
                )
            );
        }
    );

const prebookHotel =
    asyncHandler(async (req, res) => {

        const result =
            await hotelService.prebookHotel({

                userId:
                    req.user._id,

                offerId:
                    req.body.offerId,

                usePaymentSdk:
                    req.body.usePaymentSdk ||
                    false,

                hotelId:
                    req.body.hotelId,

                hotelName:
                    req.body.hotelName,

                checkIn:
                    req.body.checkIn,

                checkOut:
                    req.body.checkOut,

                currency:
                    req.body.currency ||
                    "USD",
            });


        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Hotel prebook created successfully."
            )
        );
    });


const bookHotel = asyncHandler(async (req, res) => {

    const result = await hotelService.bookHotel({
        userId: req.user._id,
        bookingId: req.params.bookingId,

        holder: req.body.holder,
        guests: req.body.guests,
        payment: req.body.payment,
        clientReference: req.body.clientReference,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            result,
            "Hotel booked successfully."
        )
    );
});


const getHotelBooking =
    asyncHandler(async (req, res) => {

        const result =
            await hotelService.getHotelBooking({

                userId:
                    req.user._id,

                bookingId:
                    req.params.bookingId,
            });


        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Hotel booking fetched successfully."
            )
        );
    });


const getUserHotelBookings =
    asyncHandler(async (req, res) => {

        const result =
            await hotelService.getUserHotelBookings(
                req.user._id
            );


        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Hotel bookings fetched successfully."
            )
        );
    });


const cancelHotelBooking =
    asyncHandler(async (req, res) => {

        const result =
            await hotelService.cancelHotelBooking({

                userId:
                    req.user._id,

                bookingId:
                    req.params.bookingId,
            });


        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Hotel booking cancelled successfully."
            )
        );
    });





export {

    createHotel,
    getAllHotels,
    getHotelById,
    searchHotels,
    filterHotels,
    updateHotel,
    deleteHotel,


    prebookHotel,
    bookHotel,
    getHotelBooking,
    getUserHotelBookings,
    cancelHotelBooking,

    externalHotelSearch,
    externalHotelSearchCoordinates,
    externalHotelFilter,
    externalHotelDetails,
    externalRoomAvailability,
    externalRoomList,
    externalRoomListAvailability,
    externalHotelPhotos,
};