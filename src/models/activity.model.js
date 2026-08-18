import mongoose, { Schema } from "mongoose";

const scheduleSchema = new Schema(
    {
        day: {
            type: String,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    }
);

// Activity Schema

const activitySchema = new Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        destination: {
            type: Schema.Types.ObjectId,
            ref: "Destination",
            required: true,
        },

        // Location

        address: {
            type: String,
            default: "",
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            default: "",
        },
        country: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },

        // Activity Details

        category: {
            type: String,
            enum: [
                "Adventure",
                "Sightseeing",
                "Nature",
                "Water Sports",
                "Wildlife",
                "Camping",
                "Religious",
                "Shopping",
                "Entertainment",
                "Cultural",
                "Nightlife",
                "Food",
                "Photography",
                "Wellness",
            ],
            required: true,
        },

        duration: {
            type: Number,
            default: 1,
        },

        durationUnit: {
            type: String,
            enum: [
                "Minutes",
                "Hours",
                "Days",
            ],
            default: "Hours",
        },

        price: {
            type: Number,
            default: 0,
        },

        currency: {
            type: String,
            default: "INR",
        },

        difficulty: {
            type: String,
            enum: [
                "Easy",
                "Moderate",
                "Hard",
            ],
            default: "Easy",
        },

        // Participants

        minimumAge: {
            type: Number,
            default: 0,
        },

        maximumAge: {
            type: Number,
            default: 100,
        },

        minimumParticipants: {
            type: Number,
            default: 1,
        },

        maximumParticipants: {
            type: Number,
            default: 20,
        },

        // Schedule

        schedule: [
            scheduleSchema,
        ],

        included: [
            String,
        ],

        excluded: [
            String,
        ],

        languages: [
            String,
        ],

        meetingPoint: {
            type: String,
            default: "",
        },

        cancellationPolicy: {
            type: String,
            default: "",
        },

        // Ratings

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        reviewCount: {
            type: Number,
            default: 0,
        },

        // Images

        coverImage: {
            url: String,
            publicId: String,
            caption: String,
        },

        galleryImages: [
            {
                url: String,
                publicId: String,
                caption: String,
            },
        ],

        // Statistics

        statistics: {
            totalBookings: {
                type: Number,
                default: 0,
            },

            totalViews: {
                type: Number,
                default: 0,
            },

            wishlistCount: {
                type: Number,
                default: 0,
            },
        },

        popularityScore: {
            type: Number,
            default: 0,
        },

        aiScore: {
            type: Number,
            default: 0,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes

activitySchema.index({
    location: "2dsphere",
});

activitySchema.index({
    destination: 1,
});

activitySchema.index({
    category: 1,
});

activitySchema.index({
    city: 1,
    country: 1,
});

activitySchema.index({
    averageRating: -1,
});

activitySchema.index({
    popularityScore: -1,
});

activitySchema.set(
    "toJSON",
    {
        versionKey: false,
    }
);

activitySchema.set(
    "toObject",
    {
        versionKey: false,
    }
);

export const Activity = mongoose.model(
    "Activity",
    activitySchema
);