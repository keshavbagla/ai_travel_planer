import { Router } from "express";
import {
    createTrip,
    getAllTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    searchTrips,
    filterTrips,
} from "../controllers/trip.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
    "/",
    verifyJWT,
    getAllTrips
);

router.get(
    "/search",
    verifyJWT,
    searchTrips
);

router.get(
    "/filter",
    verifyJWT,
    filterTrips
);

router.get(
    "/:tripId",
    verifyJWT,
    getTripById
);

router.post(
    "/",
    verifyJWT,
    createTrip
);

router.patch(
    "/:tripId",
    verifyJWT,
    updateTrip
);

router.delete(
    "/:tripId",
    verifyJWT,
    deleteTrip
);

export default router;