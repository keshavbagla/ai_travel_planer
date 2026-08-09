import { Router } from "express";
import {
    createBooking,
    getAllBookings,
    getBookingById,
    searchBookings,
    filterBookings,
    updateBooking,
    cancelBooking,
    deleteBooking,
} from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post(
    "/",
    createBooking
);

router.get(
    "/",
    getAllBookings
);

router.get(
    "/search",
    searchBookings
);

router.get(
    "/filter",
    filterBookings
);

router.get(
    "/:bookingId",
    getBookingById
);

router.patch(
    "/:bookingId",
    updateBooking
);

router.patch(
    "/:bookingId/cancel",
    cancelBooking
);

router.delete(
    "/:bookingId",
    authorize("admin"),
    deleteBooking
);

export default router;