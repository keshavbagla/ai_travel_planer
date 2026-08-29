import { Router } from "express";

import {
    createCancellation,
    getAllCancellations,
    getCancellationById,
} from "../controllers/cancellation.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post(
    "/",
    createCancellation
);

router.get(
    "/",
    getAllCancellations
);

router.get(
    "/:cancellationId",
    getCancellationById
);

export default router;