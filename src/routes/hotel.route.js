import { Router } from "express";

import {
    createHotel,
    getAllHotels,
    getHotelById,
    updateHotel,
    deleteHotel,
    searchHotels,
    filterHotels,

    // External hotel APIs
    externalHotelSearch,
    externalHotelSearchCoordinates,
    externalHotelFilter,
    externalHotelDetails,
    externalRoomAvailability,
    externalRoomList,
    externalRoomListAvailability,
    externalHotelPhotos,

    // Hotel booking
    prebookHotel,
    bookHotel,
    getHotelBooking,
    getUserHotelBookings,
    cancelHotelBooking,

} from "../controllers/hotel.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/admin.middleware.js";


const router = Router();

router.post(
    "/booking/prebook",
    verifyJWT,
    prebookHotel
);


router.post(
    "/booking/:bookingId/confirm",
    verifyJWT,
    bookHotel
);


router.get(
    "/booking",
    verifyJWT,
    getUserHotelBookings
);


router.get(
    "/booking/:bookingId",
    verifyJWT,
    getHotelBooking
);


router.put(
    "/booking/:bookingId/cancel",
    verifyJWT,
    cancelHotelBooking
);


router.get(
    "/",
    getAllHotels
);

router.get(
    "/search",
    searchHotels
);
router.get(
    "/filter",
    filterHotels
);

router.get(
    "/:hotelId",
    getHotelById
);

router.get(
    "/external/search",
    externalHotelSearch
);
router.get(
    "/external/search-coordinates",
    externalHotelSearchCoordinates
);
router.get(
    "/external/filter",
    externalHotelFilter
);


router.get(
    "/external/details",
    externalHotelDetails
);

router.get(
    "/external/room-availability",
    externalRoomAvailability
);

router.get(
    "/external/rooms",
    externalRoomList
);

router.get(
    "/external/rooms-availability",
    externalRoomListAvailability
);


router.get(
    "/external/photos",
    externalHotelPhotos
);

router.post(
    "/",
    verifyJWT,
    authorize("admin"),

    upload.fields([
        {
            name: "coverImage",
            maxCount: 1,
        },
        {
            name: "galleryImages",
            maxCount: 10,
        },
    ]),

    createHotel
);

router.patch(
    "/:hotelId",
    verifyJWT,
    authorize("admin"),

    upload.fields([
        {
            name: "coverImage",
            maxCount: 1,
        },
        {
            name: "galleryImages",
            maxCount: 10,
        },
    ]),

    updateHotel
);

router.get(
    "/bookings/my",
    verifyJWT,
    getUserHotelBookings
);

router.delete(
    "/:hotelId",
    verifyJWT,
    authorize("admin"),

    deleteHotel
);


export default router;