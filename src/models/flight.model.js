import mongoose, { Schema } from "mongoose";

const airportSchema = new Schema(
    {
        airportName: {
            type: String,
            trim: true,
            default: null,
        },

        airportCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: null,
        },

        time: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const flightSegmentSchema = new Schema(
    {
        departureAirport: {
            type: airportSchema,
            default: null,
        },

        arrivalAirport: {
            type: airportSchema,
            default: null,
        },

        durationMinutes: {
            type: Number,
            min: 0,
            default: null,
        },

        durationText: {
            type: String,
            trim: true,
            default: null,
        },

        airline: {
            type: String,
            trim: true,
            default: null,
        },

        airlineLogo: {
            type: String,
            trim: true,
            default: null,
        },

        flightNumber: {
            type: String,
            trim: true,
            default: null,
        },

        aircraft: {
            type: String,
            trim: true,
            default: null,
        },

        seat: {
            type: String,
            trim: true,
            default: null,
        },

        legroom: {
            type: String,
            trim: true,
            default: null,
        },

        extensions: {
            type: [String],
            default: [],
        },
    },
    {
        _id: false,
    }
);

const layoverSchema = new Schema(
    {
        airportCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: null,
        },

        airportName: {
            type: String,
            trim: true,
            default: null,
        },

        durationMinutes: {
            type: Number,
            min: 0,
            default: null,
        },

        durationText: {
            type: String,
            trim: true,
            default: null,
        },

        city: {
            type: String,
            trim: true,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const baggageSchema = new Schema(
    {
        carryOn: {
            type: Number,
            min: 0,
            default: null,
        },

        checked: {
            type: Number,
            min: 0,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const carbonEmissionSchema = new Schema(
    {
        differencePercent: {
            type: Number,
            default: null,
        },

        co2e: {
            type: Number,
            min: 0,
            default: null,
        },

        typicalForRoute: {
            type: Number,
            min: 0,
            default: null,
        },

        higher: {
            type: Number,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const flightOfferSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        trip: {
            type: Schema.Types.ObjectId,
            ref: "Trip",
            default: null,
        },

        provider: {
            type: String,
            enum: ["GoogleFlights"],
            required: true,
            default: "GoogleFlights",
            index: true,
        },

        departureAirport: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        arrivalAirport: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        departureTime: {
            type: Date,
            required: true,
        },

        arrivalTime: {
            type: Date,
            required: true,
        },

        durationMinutes: {
            type: Number,
            min: 0,
            required: true,
        },

        durationText: {
            type: String,
            trim: true,
            default: null,
        },

        flights: {
            type: [flightSegmentSchema],
            default: [],
        },

        delay: {
            values: {
                type: Boolean,
                default: false,
            },

            text: {
                type: Number,
                default: 0,
            },
        },

        selfTransfer: {
            type: Boolean,
            default: false,
        },

        layovers: {
            type: [layoverSchema],
            default: [],
        },

        bags: {
            type: baggageSchema,
            default: null,
        },

        carbonEmissions: {
            type: carbonEmissionSchema,
            default: null,
        },

        price: {
            type: Number,
            min: 0,
            required: true,
        },

        currency: {
            type: String,
            trim: true,
            uppercase: true,
            required: true,
        },

        stops: {
            type: Number,
            min: 0,
            required: true,
        },

        airlineLogo: {
            type: String,
            trim: true,
            default: null,
        },

        bookingToken: {
            type: String,
            required: true,
            select: false,
        },

        searchId: {
            type: String,
            trim: true,
            default: null,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        isSelected: {
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

        toJSON: {
            virtuals: true,
            versionKey: false,
        },

        toObject: {
            virtuals: true,
            versionKey: false,
        },
    }
);

flightOfferSchema.virtual("totalSegments").get(
    function () {
        return this.flights?.length || 0;
    }
);

flightOfferSchema.virtual("isNonStop").get(
    function () {
        return this.stops === 0;
    }
);

flightOfferSchema.index({
    user: 1,
    searchId: 1,
    isActive: 1,
});

flightOfferSchema.index({
    user: 1,
    trip: 1,
    isSelected: 1,
});

export const FlightOffer = mongoose.model(
    "FlightOffer",
    flightOfferSchema
);