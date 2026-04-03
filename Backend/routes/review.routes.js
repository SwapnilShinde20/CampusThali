import express from "express";
import { createReview, getChefReviews } from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// @route   POST /api/reviews
// @desc    Add a review with optional image
router.post("/", protect, upload.single("image"), createReview);

// @route   GET /api/reviews/chef/:chefId
// @desc    Get all reviews for a specific chef
router.get("/chef/:chefId", getChefReviews);

export default router;
