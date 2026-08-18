import mongoose, { Schema } from "mongoose";


const imageSchema = new Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },

        publicId: {
            type: String,
            required: true,
            trim: true,
        },

        caption: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        _id: false,
    }
);

const roomTypeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        maxGuests: {
            type: Number,
            default: 2,
            min: 1,
        },

        pricePerNight: {
            type: Number,
            required: true,
            min: 0,
        },

        amenities: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        _id: false,
    }
);


const hotelBookingSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        provider: {
            type: String,
            enum: [
                "liteapi",
                "manual",
            ],
            default: "liteapi",
        },

        offerId: {
            type: String,
            required: true,
            trim: true,
        },

        prebookId: {
            type: String,
            default: "",
            trim: true,
        },

        providerBookingId: {
            type: String,
            default: "",
            trim: true,
        },

        clientReference: {
            type: String,
            default: "",
            trim: true,
        },

        checkIn: {
            type: Date,
            required: true,
        },

        checkOut: {
            type: Date,
            required: true,
        },

        holder: {
            firstName: {
                type: String,
                required: true,
                trim: true,
            },

            lastName: {
                type: String,
                required: true,
                trim: true,
            },

            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },

            phone: {
                type: String,
                default: "",
                trim: true,
            },
        },


        guests: [
            {
                firstName: {
                    type: String,
                    required: true,
                    trim: true,
                },

                lastName: {
                    type: String,
                    required: true,
                    trim: true,
                },

                email: {
                    type: String,
                    default: "",
                    trim: true,
                    lowercase: true,
                },

                phone: {
                    type: String,
                    default: "",
                    trim: true,
                },

                type: {
                    type: String,
                    enum: [
                        "adult",
                        "child",
                    ],
                    default: "adult",
                },

                age: {
                    type: Number,
                    min: 0,
                },

                remarks: {
                    type: String,
                    default: "",
                    trim: true,
                },
            },
        ],


        roomName: {
            type: String,
            default: "",
            trim: true,
        },

        roomCount: {
            type: Number,
            default: 1,
            min: 1,
        },


        amount: {
            type: Number,
            default: 0,
            min: 0,
        },

        currency: {
            type: String,
            default: "USD",
            uppercase: true,
            trim: true,
        },


        payment: {
            status: {
                type: String,

                enum: [
                    "PENDING",
                    "AUTHORIZED",
                    "PAID",
                    "FAILED",
                    "REFUNDED",
                ],

                default: "PENDING",
            },

            method: {
                type: String,
                default: "",
                trim: true,
            },

            transactionId: {
                type: String,
                default: "",
                trim: true,
            },
        },


        status: {
            type: String,

            enum: [
                "PREBOOKED",
                "PENDING",
                "CONFIRMED",
                "CANCELLED",
                "FAILED",
            ],

            default: "PREBOOKED",
        },

        cancellation: {
            status: {
                type: String,

                enum: [
                    "NOT_CANCELLED",
                    "REQUESTED",
                    "CANCELLED",
                    "FAILED",
                ],

                default: "NOT_CANCELLED",
            },

            cancelledAt: {
                type: Date,
                default: null,
            },

            reason: {
                type: String,
                default: "",
                trim: true,
            },

            refundAmount: {
                type: Number,
                default: 0,
                min: 0,
            },

            refundCurrency: {
                type: String,
                default: "USD",
                uppercase: true,
                trim: true,
            },
        },

        prebookResponse: {
            type: Schema.Types.Mixed,
            default: null,
        },

        bookingResponse: {
            type: Schema.Types.Mixed,
            default: null,
        },

        cancellationResponse: {
            type: Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const hotelSchema = new Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        destination: {
            type: Schema.Types.ObjectId,
            ref: "Destination",
            required: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            trim: true,
        },

        country: {
            type: String,
            required: true,
            trim: true,
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


        hotelType: {
            type: String,

            enum: [
                "Hotel",
                "Resort",
                "Hostel",
                "Villa",
                "Apartment",
                "Guest House",
                "Homestay",
            ],

            default: "Hotel",
        },

        starRating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        reviewCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        pricePerNight: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        amenities: [
            {
                type: String,
                trim: true,
            },
        ],


        roomTypes: [
            roomTypeSchema,
        ],


        checkInTime: {
            type: String,
            default: "12:00 PM",
        },

        checkOutTime: {
            type: String,
            default: "11:00 AM",
        },

        cancellationPolicy: {
            type: String,
            default: "",
        },

        petsAllowed: {
            type: Boolean,
            default: false,
        },

        smokingAllowed: {
            type: Boolean,
            default: false,
        },


        phone: {
            type: String,
            default: "",
            trim: true,
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        website: {
            type: String,
            default: "",
            trim: true,
        },


        coverImage: {
            type: imageSchema,
            default: null,
        },

        galleryImages: [
            imageSchema,
        ],


        statistics: {

            totalBookings: {
                type: Number,
                default: 0,
                min: 0,
            },

            totalViews: {
                type: Number,
                default: 0,
                min: 0,
            },

            wishlistCount: {
                type: Number,
                default: 0,
                min: 0,
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

        bookings: [
            hotelBookingSchema,
        ],
    },

    {
        timestamps: true,
    }
);


hotelSchema.index({
    location: "2dsphere",
});

hotelSchema.index({
    destination: 1,
});


hotelSchema.index({
    country: 1,
    city: 1,
});

hotelSchema.index({
    starRating: -1,
});

hotelSchema.index({
    averageRating: -1,
});

hotelSchema.index({
    pricePerNight: 1,
});

hotelSchema.index({
    popularityScore: -1,
});


hotelSchema.set(
    "toJSON",
    {
        versionKey: false,
    }
);


hotelSchema.set(
    "toObject",
    {
        versionKey: false,
    }
);


export const Hotel =
    mongoose.model(
        "Hotel",
        hotelSchema
    );