import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "Booking",
                "Payment",
                "Trip",
                "System",
                "Promotion",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        referenceId: {
            type: Schema.Types.ObjectId,
            default: null,
        },

        referenceModel: {
            type: String,
            enum: [
                "Booking",
                "Payment",
                "Trip",
                null,
            ],
            default: null,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        readAt: {
            type: Date,
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({
    user: 1,
    isActive: 1,
    createdAt: -1,
});

notificationSchema.index({
    user: 1,
    isRead: 1,
});

notificationSchema.index({
    referenceId: 1,
    referenceModel: 1,
});

notificationSchema.set(
    "toJSON",
    {
        versionKey: false,
    }
);

notificationSchema.set(
    "toObject",
    {
        versionKey: false,
    }
);

export const Notification =
    mongoose.model(
        "Notification",
        notificationSchema
    );