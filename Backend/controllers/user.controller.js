import { asyncHandler } from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import { successResponse } from "../utils/apiResponse.js";

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      college: user.college,
      isProfileComplete: user.isProfileComplete,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.college = req.body.college || user.college;
    
    // Auto-complete profile if required fields are present (For Chefs only, student profile completion is optional)
    if (user.role === 'chef') {
      if (user.phone && user.college) {
        user.isProfileComplete = true;
      }
    } else {
      // Students are never "blocked" by completion, but we still track it
      if (user.phone && user.college) {
        user.isProfileComplete = true;
      }
    }

    if (req.file) {
      user.avatar = req.file.path.replace(/\\/g, '/');
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      college: updatedUser.college,
      isProfileComplete: updatedUser.isProfileComplete,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
