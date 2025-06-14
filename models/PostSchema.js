import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    visibilityScore: {
      type: Number,
      required: true,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const PostModel = new mongoose.model("Post", PostSchema);
