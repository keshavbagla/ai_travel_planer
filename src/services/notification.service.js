import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";
import { Trip } from "../models/trip.model.js";
import { ApiError } from "../utils/ApiError.js";

const populateNotification = (query) => {
    return query
        .populate(
            "user",
            "fullName email avatar"
        );
};

const validateUser = async (
    userId
) => {
    const user =
        await User.findById(
            userId
        );

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    return user;
};

const validateReference = async ({
    referenceId,
    referenceModel,
    user,
}) => {
    if (
        !referenceId ||
        !referenceModel
    ) {
        return;
    }

    let document;

    if (
        referenceModel ===
        "Booking"
    ) {
        document =
            await Booking.findOne({
                _id: referenceId,
                user,
                isActive: true,
            });
    }

    if (
        referenceModel ===
        "Payment"
    ) {
        document =
            await Payment.findOne({
                _id: referenceId,
                user,
                isActive: true,
            });
    }

    if (
        referenceModel ===
        "Trip"
    ) {
        document =
            await Trip.findOne({
                _id: referenceId,
                user,
                isActive: true,
            });
    }

    if (!document) {
        throw new ApiError(
            404,
            `${referenceModel} not found.`
        );
    }

    return document;
};

const createNotification = async (
    notificationData
) => {

    await validateUser(
        notificationData.user
    );

    await validateReference({
        referenceId:
            notificationData.referenceId,
        referenceModel:
            notificationData.referenceModel,
        user: notificationData.user,
    });

    const notification =
        await Notification.create(
            notificationData
        );

    return await populateNotification(
        Notification.findById(
            notification._id
        )
    );
};

const getAllNotifications = async ({
    page = 1,
    limit = 10,
    user,
} = {}) => {
    page = Number(page);
    limit = Number(limit);

    const skip =
        (page - 1) * limit;

    const [
        notifications,
        total,
    ] = await Promise.all([
        populateNotification(
            Notification.find({
                user,
                isActive: true,
            })
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
        ),

        Notification.countDocuments({
            user,
            isActive: true,
        }),
    ]);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(
                    total / limit
                ),
        },
    };
};

const getNotificationById = async ({
    notificationId,
    user,
}) => {
    const notification =
        await populateNotification(
            Notification.findOne({
                _id: notificationId,
                user,
                isActive: true,
            })
        );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found."
        );
    }

    return notification;
};

const searchNotifications = async (
    keyword,
    user
) => {
    if (!keyword) {
        return [];
    }

    return await populateNotification(
        Notification.find({
            user,
            isActive: true,
            $or: [
                {
                    title: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    message: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    type: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
            ],
        })
            .sort({
                createdAt: -1,
            })
            .limit(20)
    );
};

const filterNotifications = async ({
    user,
    type,
    isRead,
} = {}) => {
    const query = {
        user,
        isActive: true,
    };

    if (type) {
        query.type = type;
    }

    if (
        isRead !== undefined
    ) {
        query.isRead =
            isRead === true ||
            isRead === "true";
    }

    return await populateNotification(
        Notification.find(query)
            .sort({
                createdAt: -1,
            })
    );
};

const updateNotification = async ({
    notificationId,
    notificationData,
    user,
}) => {
    const notification =
        await Notification.findOne({
            _id: notificationId,
            user,
            isActive: true,
        });

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found."
        );
    }

    if (
        notificationData.referenceId ||
        notificationData.referenceModel
    ) {
        await validateReference({
            referenceId:
                notificationData.referenceId ||
                notification.referenceId,
            referenceModel:
                notificationData.referenceModel ||
                notification.referenceModel,
            user,
        });
    }

    Object.entries(
        notificationData
    ).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null
        ) {
            notification[key] =
                value;
        }
    });
    if (
        notification.isRead &&
        !notification.readAt
    ) {
        notification.readAt =
            new Date();
    }

    if (
        notification.isRead === false
    ) {
        notification.readAt =
            null;
    }

    await notification.save();

    return await populateNotification(
        Notification.findById(
            notification._id
        )
    );
};

const markNotificationAsRead =
    async ({
        notificationId,
        user,
    }) => {
        const notification =
            await Notification.findOne({
                _id: notificationId,
                user,
                isActive: true,
            });

        if (!notification) {
            throw new ApiError(
                404,
                "Notification not found."
            );
        }

        notification.isRead =
            true;

        notification.readAt =
            new Date();

        await notification.save();

        return await populateNotification(
            Notification.findById(
                notification._id
            )
        );
    };

const markAllNotificationsAsRead =
    async (user) => {
        const result =
            await Notification.updateMany(
                {
                    user,
                    isActive: true,
                    isRead: false,
                },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date(),
                    },
                }
            );

        return {
            modifiedCount:
                result.modifiedCount,
        };
    };

const deleteNotification = async ({
    notificationId,
    user,
}) => {
    const notification =
        await Notification.findOne({
            _id: notificationId,
            user,
            isActive: true,
        });

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found."
        );
    }

    notification.isActive =
        false;

    await notification.save();
};

export const notificationService = {
    createNotification,
    getAllNotifications,
    getNotificationById,
    searchNotifications,
    filterNotifications,
    updateNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};