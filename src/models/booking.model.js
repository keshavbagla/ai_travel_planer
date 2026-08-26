import mongoose, { Schema } from "mongoose";

const guestDetailsSchema = new Schema(
    {
        firstName: {
            type: String,
            trim: true,
            default: "",
        },

        lastName: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        _id: false,
    }
);

const bookingSchema = new Schema(
    {

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        trip: {
            type: Schema.Types.ObjectId,
            ref: "Trip",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "Flight",
                "Hotel",
                "Activity",
            ],
            required: true,
            index: true,
        },

        item: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "itemModel",
        },

        itemModel: {
            type: String,
            enum: [
                "Flight",
                "Hotel",
                "Activity",
            ],
            required: true,
        },

        provider: {
            type: String,
            required: true,
            trim: true,
        },

        externalItemId: {
            type: String,
            default: "",
            trim: true,
        },

        providerBookingId: {
            type: String,
            default: "",
            trim: true,
        },

        bookingUrl: {
            type: String,
            default: "",
            trim: true,
        },

        bookingMode: {
            type: String,
            enum: [
                "ExternalRedirect",
                "DirectAPI",
            ],
            default: "ExternalRedirect",
        },

        status: {
            type: String,
            enum: [
                "Selected",
                "BookingInitiated",
                "Redirected",
                "Confirmed",
                "Cancelled",
                "Failed",
            ],
            default: "Selected",
            index: true,
        },

        guestDetails: {
            type: guestDetailsSchema,
            default: () => ({}),
        },

        travelers: {
            adults: {
                type: Number,
                default: 1,
                min: 1,
            },

            children: {
                type: Number,
                default: 0,
                min: 0,
            },

            infants: {
                type: Number,
                default: 0,
                min: 0,
            },
        },

        amount: {
            type: Number,
            default: 0,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        startDate: {
            type: Date,
            default: null,
        },

        endDate: {
            type: Date,
            default: null,
        },

        redirectedAt: {
            type: Date,
            default: null,
        },

        confirmedAt: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

bookingSchema.index({
    user: 1,
    createdAt: -1,
});

bookingSchema.index({
    trip: 1,
    createdAt: -1,
});

bookingSchema.index({
    type: 1,
    status: 1,
});

bookingSchema.index({
    provider: 1,
    externalItemId: 1,
});

bookingSchema.index({
    provider: 1,
    providerBookingId: 1,
});

// Virtual

bookingSchema.virtual(
    "totalTravelers"
).get(function () {
    if (!this.travelers) {
        return 0;
    }

    return (
        (this.travelers.adults || 0) +
        (this.travelers.children || 0) +
        (this.travelers.infants || 0)
    );
});


bookingSchema.set(
    "toJSON",
    {
        virtuals: true,
        versionKey: false,
    }
);

bookingSchema.set(
    "toObject",
    {
        virtuals: true,
        versionKey: false,
    }
);

export const Booking = mongoose.model(
    "Booking",
    bookingSchema
);