import { Router } from "express";

import {
    createCancellation,
    getAllCancellations,
    getCancellationById,
} from "../controllers/cancellation.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

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