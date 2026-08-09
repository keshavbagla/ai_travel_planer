import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
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
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    notificationType: {
      type: String,
      enum: [
        "Trip",
        "Booking",
        "Payment",
        "Reminder",
        "Weather",
        "Promotion",
        "Security",
        "System",
        "Chat",
        "Offer",
        "Wishlist",
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: [
        "InApp",
        "Email",
        "SMS",
        "Push",
      ],
      default: "InApp",
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "Medium",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: Date,

    deliveryStatus: {
      type: String,
      enum: [
        "Pending",
        "Sent",
        "Delivered",
        "Failed",
      ],
      default: "Pending",
    },

    sentAt: Date,

    deliveredAt: Date,

    actionUrl: String,

    actionLabel: String,


    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },


    expiresAt: Date,

  },
  {
    timestamps: true,
  }
);


notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.index({
  isRead: 1,
});

notificationSchema.index({
  notificationType: 1,
});

notificationSchema.index({
  deliveryStatus: 1,
});

notificationSchema.index({
  expiresAt: 1,
});

notificationSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);