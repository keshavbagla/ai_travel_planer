import { Router } from "express";

import {
    createDestination,
    getAllDestinations,
    getDestinationById,
    updateDestination,
    deleteDestination,
    searchDestinations,
    filterDestinations,
    saveExternalDestination,
} from "../controllers/destination.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

import { authorize } from "../middlewares/admin.middleware.js";

const router = Router();

router.get(
    "/",
    getAllDestinations
);

router.get(
    "/search",
    searchDestinations
);

router.get(
    "/filter",
    filterDestinations
);

router.get(
    "/:destinationId",
    getDestinationById
);

// Protected Routes

router.post(
    "/select",
    verifyJWT,
    saveExternalDestination
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
    createDestination
);

router.patch(
    "/:destinationId",
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
    updateDestination
);

router.delete(
    "/:destinationId",
    verifyJWT,
    authorize("admin"),
    deleteDestination
);

export default router;