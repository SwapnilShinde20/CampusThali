import mongoose from "mongoose";

const chefProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bio: {
      type: String,
    },
    college: {
      type: String,
      required: [true, "Please add a college"],
    },
    phone: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChefProfile", chefProfileSchema);
