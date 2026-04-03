import Review from "../models/Review.js";
import ChefProfile from "../models/ChefProfile.js";
import mongoose from "mongoose";

/**
 * Calculates the average rating for a chef and updates their profile.
 * @param {string} chefId - The User ID of the chef.
 */
export const updateChefRating = async (chefId) => {
  const stats = await Review.aggregate([
    { $match: { chefId: new mongoose.Types.ObjectId(chefId) } },
    {
      $group: {
        _id: "$chefId",
        averageRating: { $avg: "$rating" },
        numReviews: { $count: {} },
      },
    },
  ]);

  if (stats.length > 0) {
    const { averageRating } = stats[0];
    await ChefProfile.findOneAndUpdate(
      { userId: chefId },
      { rating: parseFloat(averageRating.toFixed(1)) }, // Keep one decimal place
      { new: true }
    );
  }
};
