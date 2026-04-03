import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    chefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
    },
    image: String,
    category: {
      type: String,
      required: [true, "Please add a category"],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);