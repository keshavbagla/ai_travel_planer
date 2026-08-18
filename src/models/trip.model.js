import mongoose, { Schema } from "mongoose";

// Travelers Schema

const travelersSchema = new Schema(
    {
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
    {
        _id: false,
    }
);

// Budget Schema

const budgetSchema = new Schema(
    {
        estimatedBudget: {
            type: Number,
            default: 0,
            min: 0,
        },

        actualBudget: {
            type: Number,
            default: 0,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
        },

        budgetType: {
            type: String,
            enum: [
                "Budget",
                "Mid-Range",
                "Luxury",
            ],
            default: "Mid-Range",
        },
    },
    {
        _id: false,
    }
);

// Preferences Schema

const preferencesSchema = new Schema(
    {
        travelStyles: [
            {
                type: String,
            },
        ],

        interests: [
            {
                type: String,
            },
        ],

        foodPreferences: [
            {
                type: String,
            },
        ],

        transportPreference: {
            type: String,
            enum: [
                "Cab",
                "Rental Car",
                "Bike",
                "Public Transport",
                "Walking",
            ],
            default: "Cab",
        },
    },
    {
        _id: false,
    }
);

// Flight Schema

const selectedFlightSchema = new Schema(
    {
        airline: String,
        flightNumber: String,
        departureAirport: String,
        arrivalAirport: String,
        departureTime: Date,
        arrivalTime: Date,
        cabinClass: {
            type: String,
            enum: [
                "Economy",
                "Premium Economy",
                "Business",
                "First",
            ],
            default: "Economy",
        },
        passengers: {
            type: Number,
            default: 1,
        },
        duration: String,
        price: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: "INR",
        },
        provider: {
            type: String,
            default: "",
        },
        bookingReference: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Booked",
                "Cancelled",
            ],
            default: "Pending",
        },
    },
    {
        _id: false,
    }
);

// Itinerary Item

const itineraryItemSchema = new Schema(
  {
    time: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "Hotel",
        "Restaurant",
        "Activity",
        "Flight",
        "Transport",
        "Custom",
      ],
      required: true,
    },

    reference: {
      type: Schema.Types.ObjectId,
      refPath: "itinerary.items.type",
    },

    title: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: 60,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

// Day wise Itinerary

const itineraryDaySchema = new Schema(
  {
    day: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    items: [itineraryItemSchema],
  },
  {
    _id: false,
  }
);

// Trip Schema

const tripSchema = new Schema(
  {
    // Basic Information

    tripName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // References

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },

    restaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],

    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],

    // Tavel Dates

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Travelers

    travelers: {
      type: travelersSchema,
      default: () => ({}),
      required: true,
    },

    // Budget

    budget: {
      type: budgetSchema,
      default: () => ({}),
    },

    // Preferences

    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },

    // Selected Flight

    selectedFlight: {
      type: selectedFlightSchema,
      default: null,
    },

    // Day-wise Itinerary

    itinerary: [itineraryDaySchema,],

    // AI Information

    isAIGenerated: {
      type: Boolean,
      default: false,
    },

    aiPrompt: {
      type: String,
      default: "",
    },

    aiSummary: {
      type: String,
      default: "",
    },

    // Status

    status: {
      type: String,
      enum: [
        "Planning",
        "Confirmed",
        "Completed",
        "Cancelled",
      ],
      default: "Planning",
    },

    // Statistics

    statistics: {
      totalViews: {
        type: Number,
        default: 0,
      },

      totalBookings: {
        type: Number,
        default: 0,
      },

      totalShares: {
        type: Number,
        default: 0,
      },
    },

    // Flags

    isPublic: {
      type: Boolean,
      default: false,
    },

    isArchived: {
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
  }
);

// Indexes

tripSchema.index({
    user: 1,
});

tripSchema.index({
    destination: 1,
});

tripSchema.index({
    status: 1,
});

tripSchema.index({
    startDate: 1,
    endDate: 1,
});

tripSchema.index({
    isActive: 1,
});

tripSchema.index({
    createdAt: -1,
});

tripSchema.index({
    tripName: "text",
    description: "text",
});

tripSchema.pre("save", function () {
    if (this.startDate && this.endDate) {
        const diff = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        this.totalDays = Math.max(diff, 1);
    }
  }
);

tripSchema.virtual(
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

tripSchema.set(
    "toJSON",
    {
        virtuals: true,
        versionKey: false,
    }
);

tripSchema.set(
    "toObject",
    {
        virtuals: true,
        versionKey: false,
    }
);

export const Trip = mongoose.model("Trip", tripSchema);