import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    profileImagePublicId: {
      type: String,
      default: "",
    },


    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },


    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },


    country: String,
    state: String,
    city: String,
    timezone: String,

    preferences: {
      preferredCurrency: {
        type: String,
        default: "INR",
      },

      language: {
        type: String,
        default: "English",
      },

      travelStyle: {
        type: String,
        enum: [
          "Luxury",
          "Budget",
          "Adventure",
          "Business",
          "Family",
          "Solo",
          "Romantic",
        ],
        default: "Budget",
      },

      accommodationType: {
        type: String,
        enum: [
          "Hotel",
          "Hostel",
          "Apartment",
          "Villa",
          "Resort",
          "Any",
        ],
        default: "Any",
      },

      foodPreference: {
        type: String,
        enum: [
          "Veg",
          "Non-Veg",
          "Vegan",
          "Jain",
          "Halal",
          "No Preference",
        ],
        default: "No Preference",
      },

      preferredSeat: {
        type: String,
        enum: [
          "Window",
          "Middle",
          "Aisle",
        ],
        default: "Window",
      },
    },


    passport: {
      passportNumber: String,
      nationality: String,
      expiryDate: Date,
    },


    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },


    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Destination",
      },
    ],


    recentSearches: [
      {
        query: String,
        destination: String,
        searchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],


    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },

      push: {
        type: Boolean,
        default: true,
      },
    },


    refreshToken: {
      type: String,
      select: false,
    },

    lastLogin: Date,

    accountStatus: {
      type: String,
      enum: [
        "active",
        "blocked",
        "suspended",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(
    password,
    this.password
  );
};


userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },

    process.env.ACCESS_TOKEN_SECRET,

    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};


userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },

    process.env.REFRESH_TOKEN_SECRET,

    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);