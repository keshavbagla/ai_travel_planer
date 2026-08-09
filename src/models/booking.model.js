import mongoose, { Schema } from "mongoose";

const bookingItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "Flight",
        "Hotel",
        "Activity",
        "Transport",
        "Package",
      ],
      required: true,
    },

    provider: String,
    name: String,
    bookingReference: String,
    bookingURL: String,

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    startDate: Date,
    endDate: Date,

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Cancelled",
        "Refunded",
        "Completed",
      ],
      default: "Pending",
    },

    price: {
      amount: Number,
      currency: {
        type: String,
        default: "INR",
      },
    },

    cancellationPolicy: String,

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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

    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    bookingItems: [bookingItemSchema],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    bookingStatus: {
      type: String,
      enum: [
        "Pending",
        "Partially Confirmed",
        "Confirmed",
        "Cancelled",
        "Completed",
      ],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
        "Partially Refunded",
      ],
      default: "Pending",
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    cancellationReason: String,
    cancelledAt: Date,

    bookedBy: {
      type: String,
      enum: [
        "AI",
        "User",
      ],
      default: "User",
    },

    notes: String,
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);