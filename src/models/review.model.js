import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        reviewType: {
            type: String,
            enum: [
                "Trip",
                "Hotel",
                "Activity",
                "Restaurant",
            ],
            required: true,
            index: true,
        },

        referenceId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        title: {
            type: String,
            trim: true,
            default: "",
        },

        comment: {
            type: String,
            trim: true,
            default: "",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isEdited: {
            type: Boolean,
            default: false,
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

reviewSchema.index(
    {
        user: 1,
        reviewType: 1,
        referenceId: 1,
    },
    {
        unique: true,
    }
);

reviewSchema.index({
    reviewType: 1,
    referenceId: 1,
    isActive: 1,
    createdAt: -1,
});

reviewSchema.index({
    user: 1,
    isActive: 1,
    createdAt: -1,
});

reviewSchema.set(
    "toJSON",
    {
        versionKey: false,
    }
);

reviewSchema.set(
    "toObject",
    {
        versionKey: false,
    }
);

export const Review =
    mongoose.model(
        "Review",
        reviewSchema
    );