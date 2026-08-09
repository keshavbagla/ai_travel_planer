import { Router } from "express";
import {
    createHotel,
    getAllHotels,
    getHotelById,
    updateHotel,
    deleteHotel,
    searchHotels,
    filterHotels,
} from "../controllers/hotel.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/admin.middleware.js";

const router = Router();

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

// Admin Routes

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

router.delete(
    "/:hotelId",
    verifyJWT,
    authorize("admin"),
    deleteHotel
);

export default router;