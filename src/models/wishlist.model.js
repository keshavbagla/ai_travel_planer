import mongoose, { Schema } from "mongoose";

const wishlistSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        itemType: {
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

        itemId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
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

// One wishlist entry per user and entity

wishlistSchema.index(
    {
        user: 1,
        itemType: 1,
        itemId: 1,
    },
    {
        unique: true,
    }
);

wishlistSchema.index({
    user: 1,
    isActive: 1,
    createdAt: -1,
});


wishlistSchema.index({
    user: 1,
    itemType: 1,
    isActive: 1,
    createdAt: -1,
});

wishlistSchema.set(
    "toJSON",
    {
        versionKey: false,
    }
);

wishlistSchema.set(
    "toObject",
    {
        versionKey: false,
    }
);

export const Wishlist =
    mongoose.model(
        "Wishlist",
        wishlistSchema
    );