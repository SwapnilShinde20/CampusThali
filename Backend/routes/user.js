import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single('image'), updateUserProfile);

export default router;
