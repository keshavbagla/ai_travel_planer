import mongoose, { Schema } from "mongoose";

const travelerSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

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

        dateOfBirth: {
            type: Date,
            required: true,
        },

        gender: {
            type: String,
            enum: [
                "Male",
                "Female",
                "Other",
            ],
            required: true,
        },

        nationality: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
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

        passport: {
            type: new Schema(
                {
                    passportNumber: {
                        type: String,
                        trim: true,
                        uppercase: true,
                        default: "",
                    },

                    issueDate: {
                        type: Date,
                        default: null,
                    },

                    expiryDate: {
                        type: Date,
                        default: null,
                    },

                    issuingCountry: {
                        type: String,
                        trim: true,
                        uppercase: true,
                        default: "",
                    },
                },
                {
                    _id: false,
                }
            ),

            default: null,
        },

        travelerType: {
            type: String,
            enum: [
                "Adult",
                "Child",
                "Infant",
            ],
            default: "Adult",
        },

        isPrimary: {
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

// User's active travelers

travelerSchema.index({
    user: 1,
    isActive: 1,
});

// Prevent duplicate traveler profiles
// for the same user

travelerSchema.index(
    {
        user: 1,
        firstName: 1,
        lastName: 1,
        dateOfBirth: 1,
    },
    {
        unique: true,
    }
);

travelerSchema.set(
    "toJSON",
    {
        versionKey: false,
    }
);

travelerSchema.set(
    "toObject",
    {
        versionKey: false,
    }
);

export const Traveler =
    mongoose.model(
        "Traveler",
        travelerSchema
    );