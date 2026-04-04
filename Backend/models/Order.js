import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
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
    items: [
      {
        menuId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        name: String, // Snapshot for history
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    itemsTotal: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    chefEarning: {
      type: Number,
      required: true,
    },
    adminEarning: {
      type: Number,
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    addressSnapshot: {
      label: String,
      buildingType: String,
      addressLine: String,
      buildingName: String,
      landmark: String,
      area: String,
      city: String,
      pincode: String,
      lat: Number,
      lng: Number,
      receiverName: String,
      receiverPhone: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    razorpayOrderId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
