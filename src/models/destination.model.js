import mongoose, { Schema } from "mongoose";

const airportSchema = new Schema(
  {
    airportName: String,
    airportCode: String,
    distance: Number,
  },
  {
    _id: false,
  }
);

// Destination Schema

const destinationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    continent: String,

    destinationCode: {
      type: String,
      unique: true,
      uppercase: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Description

    description: {
      type: String,
      trim: true,
    },

    // Destination Categories

    destinationType: [
      {
        type: String,
        enum: [
          "Beach",
          "Mountain",
          "Hill Station",
          "City",
          "Adventure",
          "Wildlife",
          "Desert",
          "Forest",
          "Island",
          "Snow",
          "Religious",
          "Historical",
          "Luxury",
          "Nature"
        ]
      }
    ],

    isFeatured: {
      type: Boolean,
      default: false
    },

    recommendedDuration: {
      minDays: {
        type: Number,
        default: 1
      },

      maxDays: {
        type: Number,
        default: 3
      }
    },

    weather: {
      latitude: Number,
      longitude: Number
    },

    searchKeywords: [
      String
    ],

    embeddingId: {
      type: String,
      default: ""
    },

    // Geo Location
    
    geoapifyPlaceId: {
        type: String,
        trim: true,
    },

    countryCode: {
        type: String,
        trim: true,
        uppercase: true,
    },

    placeType: {
        type: String,
        trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], 
        required: true
      }
    },

    timezone: String,
    nearbyAirports: [airportSchema],

    // Climate

    climate: {
      averageTemperature: Number,
      summerSeason: String,
      winterSeason: String,
      rainySeason: String

    },

    bestMonths: [
      String
    ],

    // Budget
    
    averageDailyBudget: {
      budget: Number,
      midRange: Number,
      luxury: Number
    },

    currency: {
      type: String,
      default: "INR"
    },

    // Activities

    popularActivities: [
      String
    ],

    famousFor: [
      String
    ],

    // Suitable For
  
    suitableFor: [
      {
        type: String,
        enum: [
          "Solo",
          "Couple",
          "Family",
          "Friends",
          "Business",
          "Honeymoon"
        ]
      }
    ],

    travelStyles: [
      {
        type: String,
        enum: [
          "Budget",
          "Luxury",
          "Adventure",
          "Backpacking",
          "Relaxation",
          "Business"
        ]
      }
    ],

    // Attractions
    
    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity"
      }
    ],    

    // Restaurants
    
    restaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Restaurant"
      }
    ],

    // Hotels
    
    hotels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Hotel"
      }
    ],

    // Transport

    transportation: {
      airportTransfer: Boolean,
      metro: Boolean,
      bus: Boolean,
      taxi: Boolean,
      bikeRental: Boolean
    },

    // Travel Information

    primaryAirportIata: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    visaRequired: {
      type: Boolean,
      default: false
    },

    languages: [
      String
    ],

    emergencyContacts: {
      police: String,
      ambulance: String,
      fire: String,
      touristHelpline: String
    },

    statistics: {
      totalBookings: {
        type: Number,
        default: 0
      },

      totalViews: {
        type: Number,
        default: 0
      },

      wishlistCount: {
        type: Number,
        default: 0
      }
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review"
      }
    ],

    // AI Scores

    aiScores: {
      family: {
        type: Number,
        default: 0
      },

      solo: {
        type: Number,
        default: 0
      },

      honeymoon: {
        type: Number,
        default: 0
      },

      adventure: {
        type: Number,
        default: 0
      },

      luxury: {
        type: Number,
        default: 0
      },

      budget: {
        type: Number,
        default: 0
      }
    },

    // Ratings
    
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    popularityScore: {
      type: Number,
      default: 0
    },

    // Images
    
    coverImage: {
      url: {
        type: String,
        default: ""
      },

      publicId: {
        type: String,
        default: ""
      },

      caption: {
        type: String,
        default: ""
      }
    },

    galleryImages: [
      {
        url: {
          type: String,
          required: true
        },

        publicId: {
          type: String,
          required: true
        },

        caption: {
          type: String,
          default: ""
        }
      }
    ],
    
    // Status
    
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes

destinationSchema.index({
    averageRating: -1
});

destinationSchema.index({
    isFeatured: 1
});

destinationSchema.index({
    searchKeywords: 1
});

destinationSchema.index({
  country: 1,
  state: 1,
  city: 1
});

destinationSchema.index({
  destinationType: 1,
  averageRating: -1
});

destinationSchema.index({
    geoapifyPlaceId: 1,
});

destinationSchema.set("toJSON", {
    versionKey: false,
});

destinationSchema.set("toObject", {
    versionKey: false,
});

// Model

export const Destination = mongoose.model(
  "Destination",
  destinationSchema
);