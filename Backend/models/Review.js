import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // Only one review per order
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // File path for review photo
    },
  },
  { timestamps: true }
);

// Index to prevent a student from reviewing the same order twice
reviewSchema.index({ studentId: 1, orderId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
