import { getApprovedChefs, getChefProfileById, getChefProfileByUserId, updateChefProfile } from '../services/chef.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get all approved chefs (filtered by optional college query string)
// @route   GET /api/chefs
// @access  Public
export const getChefs = asyncHandler(async (req, res) => {
  const { college } = req.query;
  const chefs = await getApprovedChefs(college);
  
  successResponse(res, 200, 'Chefs retrieved successfully', chefs);
});

// @desc    Get a single approved chef by ID
// @route   GET /api/chefs/:id
// @access  Public
export const getChef = asyncHandler(async (req, res) => {
  const chef = await getChefProfileById(req.params.id);
  
  successResponse(res, 200, 'Chef retrieved successfully', chef);
});

// @desc    Get current chef's profile
// @route   GET /api/chefs/me
// @access  Private (Chef)
export const getMe = asyncHandler(async (req, res) => {
  console.log("Fetching profile for User ID:", req.user.id);
  const chef = await getChefProfileByUserId(req.user.id);
  
  if (!chef) {
    console.log("No ChefProfile found for User ID:", req.user.id);
    res.status(404);
    throw new Error('Chef profile not found');
  }

  console.log("ChefProfile found:", chef._id);
  successResponse(res, 200, 'Chef profile retrieved', chef);
});

// @desc    Update current chef's profile
// @route   PUT /api/chefs/profile
// @access  Private (Chef)
export const updateProfile = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) {
    updateData.profileImage = req.file.path.replace(/\\/g, '/');
  }
  const chef = await updateChefProfile(req.user.id, updateData);
  successResponse(res, 200, 'Chef profile updated', chef);
});
