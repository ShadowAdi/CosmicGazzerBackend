import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    eventId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Event",
    },
    notifyAt: Date,
    notified: Boolean,
  },
  {
    timestamps: true,
  }
);

export const ReminderModel = new mongoose.model("Reminder", ReminderSchema);
