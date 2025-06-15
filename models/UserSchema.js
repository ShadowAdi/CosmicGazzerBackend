import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    bio: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (value) {
            return (
              Array.isArray(value) &&
              value.length === 2 &&
              typeof value[0] === "number" &&
              typeof value[1] === "number" &&
              value[0] >= -180 &&
              value[0] <= 180 && // longitude
              value[1] >= -90 &&
              value[1] <= 90 // latitude
            );
          },
          message:
            "Coordinates must be [longitude, latitude] with valid ranges.",
        },
      },
    },
    savedEvents: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  {
    timeStamps: true,
  }
);

export const UserModel = mongoose.model("User", UserSchema);
