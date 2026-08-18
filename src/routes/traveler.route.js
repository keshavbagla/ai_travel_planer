import { Router } from "express";

import {
    createTraveler,
    getAllTravelers,
    getTravelerById,
    updateTraveler,
    deleteTraveler,
    setPrimaryTraveler,
    searchTravelers,
} from "../controllers/traveler.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.get(
    "/search",
    searchTravelers
);

router.post(
    "/",
    createTraveler
);
router.get(
    "/",
    getAllTravelers
);

router.get(
    "/:travelerId",
    getTravelerById
);

router.patch(
    "/:travelerId",
    updateTraveler
);

router.delete(
    "/:travelerId",
    deleteTraveler
);

router.patch(
    "/:travelerId/primary",
    setPrimaryTraveler
);

export default router;