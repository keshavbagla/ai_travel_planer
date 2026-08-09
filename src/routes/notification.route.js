import { Router } from "express";

import {
    createNotification,
    getAllNotifications,
    getNotificationById,
    searchNotifications,
    filterNotifications,
    updateNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);


router.post(
    "/",
    createNotification
);

router.get(
    "/",
    getAllNotifications
);

router.get(
    "/search",
    searchNotifications
);

router.get(
    "/filter",
    filterNotifications
);

router.patch(
    "/read-all",
    markAllNotificationsAsRead
);

router.get(
    "/:notificationId",
    getNotificationById
);

router.patch(
    "/:notificationId",
    updateNotification
);

router.patch(
    "/:notificationId/read",
    markNotificationAsRead
);

router.delete(
    "/:notificationId",
    deleteNotification
);

export default router;