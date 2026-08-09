import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
  {

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },


    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },


    otp: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },


    purpose: {
      type: String,
      enum: [
        "REGISTER",
        "LOGIN",
        "FORGOT_PASSWORD",
        "EMAIL_VERIFICATION",
        "PHONE_VERIFICATION",
      ],
      required: true,
    },


    isUsed: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


otpSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);


otpSchema.index(
  {
    user: 1,
    purpose: 1,
    isUsed: 1,
  },

  {
    unique: true,
    partialFilterExpression: {isUsed: false}
  }
);

// Model

export const OTP = mongoose.model("OTP", otpSchema);