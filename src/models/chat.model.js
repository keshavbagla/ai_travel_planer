import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["system", "user", "assistant", "tool"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    toolName: String,

    toolResponse: {
      type: Schema.Types.Mixed,
    },

    tokenUsage: {
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const preferenceSchema = new Schema(
  {
    budget: Number,
    currency: {
      type: String,
      default: "INR",
    },

    destinationType: [String],
    travelStyle: String,
    foodPreference: String,
    accommodationType: String,
    transportation: String,
    preferredSeason: String,
    travelers: {
      adults: Number,
      children: Number,
      infants: Number,
    },
  },
  {
    _id: false,
  }
);

const toolCallSchema = new Schema(
  {
    toolName: {
      type: String,
      required: true,
    },

    provider: String,
    request: Schema.Types.Mixed,
    response: Schema.Types.Mixed,
    status: {
      type: String,
      enum: [
        "Pending",
        "Success",
        "Failed",
      ],
      default: "Success",
    },

    executionTime: Number,
  },
  {
    timestamps: true,
    _id: false,
  }
);

const chatSchema = new Schema(
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

    title: {
      type: String,
      default: "New Conversation",
    },

    messages: [messageSchema],

    summary: {
      type: String,
    },

    extractedPreferences: preferenceSchema,

    context: {
      destination: String,
      currentStep: String,

      planningStage: {
        type: String,
        enum: [
          "Preference Collection",
          "Destination Selection",
          "Flight Search",
          "Hotel Search",
          "Itinerary Generation",
          "Booking",
          "Completed",
        ],
        default: "Preference Collection",
      },
    },

    toolCalls: [toolCallSchema],


    aiProvider: {
      type: String,
      enum: [
        "Gemini",
        "OpenAI",
        "Claude",
        "Groq",
        "Other",
      ],
      default: "Gemini",
    },

    model: {
      type: String,
      default: "gemini-2.5-flash",
    },

    totalTokens: {
      type: Number,
      default: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "Active",
        "Archived",
      ],
      default: "Active",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

  },
  {
    timestamps: true,
  }
);

chatSchema.pre("save", function (next) {
  this.lastMessageAt = new Date();
  next();
});


export const Chat = mongoose.model("Chat", chatSchema);