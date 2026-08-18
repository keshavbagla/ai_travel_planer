import mongoose, { Schema } from "mongoose";

const cancellationSchema = new Schema(
    {
        booking: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true,
            index: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        reason: {
            type: String,
            trim: true,
            required: true,
        },

        cancellationStatus: {
            type: String,
            enum: [
                "Requested",
                "Approved",
                "Rejected",
                "Completed",
            ],
            default: "Requested",
            index: true,
        },

        refundAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        refundStatus: {
            type: String,
            enum: [
                "NotApplicable",
                "Pending",
                "Processing",
                "Completed",
                "Failed",
            ],
            default: "NotApplicable",
            index: true,
        },

        cancellationDate: {
            type: Date,
            default: Date.now,
        },

        processedAt: {
            type: Date,
            default: null,
        },

        notes: {
            type: String,
            trim: true,
            default: "",
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

cancellationSchema.index({
    user: 1,
    createdAt: -1,
});

cancellationSchema.index({
    cancellationStatus: 1,
    refundStatus: 1,
    createdAt: -1,
});

cancellationSchema.set(
    "toJSON",
    {
        versionKey: false,
    }
);

cancellationSchema.set(
    "toObject",
    {
        versionKey: false,
    }
);

export const Cancellation =
    mongoose.model(
        "Cancellation",
        cancellationSchema
    );