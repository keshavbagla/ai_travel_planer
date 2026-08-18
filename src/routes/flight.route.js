import { Router } from "express";

import {
    searchAndSaveFlightOffers,
    getFlightOfferById,
    selectFlightOffer,
    getSelectedFlightBookingDetails,
    getSelectedFlightBookingUrl,
    searchFlightsByDestination,
} from "../controllers/flight.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/search",
    verifyJWT,
    searchAndSaveFlightOffers
);

router.post(
    "/search-by-destination",
    verifyJWT,
    searchFlightsByDestination
);

router.post(
    "/select",
    verifyJWT,
    selectFlightOffer
);

router.get(
    "/:flightOfferId/booking-details",
    verifyJWT,
    getSelectedFlightBookingDetails
);

router.get(
    "/:flightOfferId/booking-url",
    verifyJWT,
    getSelectedFlightBookingUrl
);

router.get(
    "/:flightOfferId",
    verifyJWT,
    getFlightOfferById
);

export default router;