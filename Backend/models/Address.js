import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["Home", "Work", "Others"],
      default: "Home",
    },
    buildingType: {
      type: String,
      enum: ["Society", "Independent house", "Standalone", "Office", "Hotel", "Others"],
      default: "Society",
    },
    addressLine: {
      type: String,
      required: [true, "Complete address is required"],
      trim: true,
    },
    houseNo: {
      type: String,
      trim: true,
    },
    buildingName: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
    },
    lat: {
      type: Number,
      required: [true, "Latitude is required for map selection"],
    },
    lng: {
      type: Number,
      required: [true, "Longitude is required for map selection"],
    },
    receiverName: {
      type: String,
      trim: true,
    },
    receiverPhone: {
      type: String,
      required: [true, "Receiver contact number is required"],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
