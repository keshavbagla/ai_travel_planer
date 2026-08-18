import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        paymentReference: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },

        transactionId: {
            type: String,
            default: null,
            trim: true,
            index: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        booking: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            trim: true,
            uppercase: true,
        },

        paymentMethod: {
            type: String,
            enum: [
                "Card",
                "UPI",
                "Net Banking",
                "Wallet",
                "Cash",
            ],
            required: true,
        },

        paymentGateway: {
            type: String,
            enum: [
                "Razorpay",
                "Stripe",
                "PayPal",
                "Cash",
                "Other",
            ],
            default: "Razorpay",
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Processing",
                "Paid",
                "Failed",
                "Refunded",
                "Partially Refunded",
            ],
            default: "Pending",
            index: true,
        },

        failureReason: {
            type: String,
            trim: true,
            default: "",
        },

        refundAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        refundReason: {
            type: String,
            trim: true,
            default: "",
        },

        refundedAt: {
            type: Date,
            default: null,
        },

        paidAt: {
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
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

paymentSchema.index({
    user: 1,
    isActive: 1,
});

paymentSchema.index({
    booking: 1,
    isActive: 1,
});

paymentSchema.index({
    createdAt: -1,
});

export const Payment = mongoose.model(
    "Payment",
    paymentSchema
);