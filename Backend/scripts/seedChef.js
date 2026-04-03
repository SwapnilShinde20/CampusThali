import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import ChefProfile from "../models/ChefProfile.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Database connected. Seeding Chef...");

    // Create a dummy user
    const dummyUser = await User.create({
      name: "Chef Sanjeev",
      email: "sanjeev@test.com",
      password: "password123", // Doesn't matter for this test
      role: "chef",
    });

    console.log("User created:", dummyUser._id);

    // Create the dummy ChefProfile
    await ChefProfile.create({
      userId: dummyUser._id,
      bio: "Expert in home-cooked North Indian Thalis.",
      college: "xyz",
      rating: 4.8,
      isApproved: true,
      isAvailable: true,
    });

    console.log("✅ Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
