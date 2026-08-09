 import { Router } from "express";
import {
    createActivity,
    getAllActivities,
    getActivityById,
    updateActivity,
    deleteActivity,
    searchActivities,
    filterActivities,
} from "../controllers/activity.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getAllActivities);

router.get("/search", searchActivities);

router.get("/filter", filterActivities);

router.get("/:activityId", getActivityById);

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
    createActivity
);

router.patch(
    "/:activityId",
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
    updateActivity
);

router.delete(
    "/:activityId",
    verifyJWT,
    authorize("admin"),
    deleteActivity
);

export default router;