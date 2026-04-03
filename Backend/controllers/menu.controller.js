import {
  createMenuItem,
  getMenuItemsByChef,
  updateMenuItem,
  deleteMenuItem,
} from '../services/menu.service.js';
import ChefProfile from '../models/ChefProfile.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private
export const createItem = asyncHandler(async (req, res) => {
  const menuData = { ...req.body };
  if (req.file) {
    menuData.image = req.file.path.replace(/\\/g, '/');
  }

  // Verify chef is approved
  const chefProfile = await ChefProfile.findOne({ userId: req.user._id });
  if (!chefProfile || !chefProfile.isApproved) {
    res.status(403);
    throw new Error('Merchant action restricted: Your chef account is pending admin approval.');
  }
  
  const item = await createMenuItem(menuData);
  successResponse(res, 201, 'Menu item created successfully', item);
});

// @desc    Get menu items by chef ID
// @route   GET /api/menu/:chefId
// @access  Public
export const getItemsByChef = asyncHandler(async (req, res) => {
  console.log("Fetching menu items for Chef (User ID):", req.params.chefId);
  const items = await getMenuItemsByChef(req.params.chefId);
  console.log(`Found ${items.length} menu items for chef: ${req.params.chefId}`);
  successResponse(res, 200, 'Menu items retrieved successfully', items);
});

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private
export const updateItem = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) {
    updateData.image = req.file.path.replace(/\\/g, '/');
  }

  // Verify chef is approved
  const chefProfile = await ChefProfile.findOne({ userId: req.user._id });
  if (!chefProfile || !chefProfile.isApproved) {
    res.status(403);
    throw new Error('Merchant action restricted: Your chef account is pending admin approval.');
  }

  const updatedItem = await updateMenuItem(req.params.id, updateData);
  successResponse(res, 200, 'Menu item updated successfully', updatedItem);
});

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private
// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private
export const deleteItem = asyncHandler(async (req, res) => {
  await deleteMenuItem(req.params.id);
  successResponse(res, 200, 'Menu item deleted successfully');
});
