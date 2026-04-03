import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Menu from "../models/Menu.js";
import ChefProfile from "../models/ChefProfile.js";
import Address from "../models/Address.js";

dotenv.config();

const resetDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connect to MongoDB for reset...");

    // Delete all data from collections
    await User.deleteMany({});
    await Order.deleteMany({});
    await Menu.deleteMany({});
    await ChefProfile.deleteMany({});
    await Address.deleteMany({});

    console.log("✅ Database cleared successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error.message);
    process.exit(1);
  }
};

resetDB();
