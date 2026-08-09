import mongoose, { Schema } from "mongoose";

const openingHoursSchema = new Schema(
    {
        day: {
            type: String,
            required: true,
        },

        open: {
            type: String,
            required: true,
        },

        close: {
            type: String,
            required: true,
        },

        isClosed: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: false,
    }
);

const menuCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },

        items: [
            {
                name: String,
                description: String,
                price: Number,
                isVeg: Boolean,
                isAvailable: {
                    type: Boolean,
                    default: true,
                },
            },
        ],
    },
    {
        _id: false,
    }
);

// Restaurant Schema

const restaurantSchema = new Schema(
    {
        // Basic Information

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
            index: true,
        },

        // Address

        address: {
            type: String,
            required: true,
        },

        city: {
            type: String,
            required: true,
        },

        state: String,

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

        // Restaurant Details

        cuisine: [
            String,
        ],

        restaurantType: {
            type: String,
            enum: [
                "Fine Dining",
                "Casual Dining",
                "Cafe",
                "Street Food",
                "Buffet",
                "Fast Food",
                "Bakery",
                "Bar",
            ],
            default: "Casual Dining",
        },

        averageCostForTwo: {
            type: Number,
            default: 0,
        },

        currency: {
            type: String,
            default: "INR",
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

        // Facilities

        amenities: [
            String,
        ],

        dietaryOptions: [
            {
                type: String,
                enum: [
                    "Veg",
                    "Vegan",
                    "Jain",
                    "Halal",
                    "Gluten Free",
                ],
            },
        ],

        tableReservation: {
            type: Boolean,
            default: false,
        },

        takeawayAvailable: {
            type: Boolean,
            default: true,
        },

        deliveryAvailable: {
            type: Boolean,
            default: false,
        },

        phone: {
            type: String,
            default: "",
        },

        email: {
            type: String,
            default: "",
        },

        website: {
            type: String,
            default: "",
        },

        // Timing

        openingHours: [
            openingHoursSchema,
        ],

        // Menu

        menu: [
            menuCategorySchema,
        ],

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

        statistics: {
            totalViews: {
                type: Number,
                default: 0,
            },

            totalReservations: {
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

restaurantSchema.index({
    location: "2dsphere",
});

restaurantSchema.index({
    destination: 1,
});

restaurantSchema.index({
    city: 1,
    country: 1,
});

restaurantSchema.index({
    cuisine: 1,
});

restaurantSchema.index({
    averageRating: -1,
});

restaurantSchema.index({
    popularityScore: -1,
});

restaurantSchema.set("toJSON", {
    versionKey: false,
});

restaurantSchema.set("toObject", {
    versionKey: false,
});

export const Restaurant = mongoose.model(
    "Restaurant",
    restaurantSchema
);