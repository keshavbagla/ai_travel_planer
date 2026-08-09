import mongoose, { Schema } from "mongoose";


const refundSchema = new Schema(
  {
    refundId: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number,
      default: 0,
    },

    reason: String,

    status: {
      type: String,
      enum: [
        "Pending",
        "Processed",
        "Failed",
      ],
      default: "Pending",
    },

    processedAt: Date,
  },
  {
    _id: false,
  }
);


const paymentSchema = new Schema(
  {


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


    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    orderId: {
      type: String,
      trim: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    gateway: {
      type: String,
      enum: [
        "Stripe",
        "Razorpay",
        "PayPal",
        "Cash",
        "UPI",
      ],
      required: true,
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

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Authorized",
        "Paid",
        "Failed",
        "Cancelled",
        "Refunded",
        "Partially Refunded",
      ],
      default: "Pending",
    },


    refund: refundSchema,


    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },

    billingAddress: {

      fullName: String,

      email: String,

      phoneNumber: String,

      addressLine1: String,

      addressLine2: String,

      city: String,

      state: String,

      country: String,

      postalCode: String,

    },

    paidAt: Date,

    failureReason: String,

  },
  {
    timestamps: true,
  }
);


paymentSchema.index({
  paymentId: 1,
});

paymentSchema.index({
  booking: 1,
});

paymentSchema.index({
  user: 1,
});

paymentSchema.index({
  paymentStatus: 1,
});

paymentSchema.index({
  gateway: 1,
});

export const Payment = mongoose.model(
  "Payment",
  paymentSchema
);