import {
    Router,
} from "express";

import {
    searchPlaces,
    getPlaceDetails,
    getPlacePhoto,
} from "../controllers/googlePlaces.controller.js";

const router =
    Router();

router.post(
    "/search",
    searchPlaces
);

router.get(
    "/:placeId",
    getPlaceDetails
);

router.post(
    "/photo",
    getPlacePhoto
);


export default router;