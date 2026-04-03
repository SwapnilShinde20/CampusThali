import { registerUser, loginUser } from '../services/auth.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  // Explicit role validation
  if (role && !['student', 'chef'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role value');
  }

  const userData = await registerUser(req.body);
  successResponse(res, 201, 'User registered successfully', userData);
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const userData = await loginUser(req.body);
  successResponse(res, 200, 'Login successful', userData);
});
