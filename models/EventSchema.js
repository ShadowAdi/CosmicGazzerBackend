import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["Meteor Shower", "ISS Pass", "Lunar Eclipse"],
      default: "Meteor Shower",
    },
    startTime: Date,
    endTime: Date,
    visibilityRegions: [String],
    moonPhase: Number,
    source: String,
    postedUserId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const EventModel = mongoose.model("Event", EventSchema);
