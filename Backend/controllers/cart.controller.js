import Cart from "../models/Cart.js";
import Menu from "../models/Menu.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate("items.menuId");
  
  if (!cart) {
    return successResponse(res, 200, "Cart is empty", { items: [], chefId: null });
  }

  successResponse(res, 200, "Cart retrieved successfully", cart);
});

// @desc    Sync/Update user's cart (Hybrid Logic)
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body; // Array of { menuId, quantity }

  if (!items || items.length === 0) {
    await Cart.findOneAndDelete({ userId: req.user._id });
    return successResponse(res, 200, "Cart cleared", { items: [], chefId: null });
  }

  // Get chefId from the first item to ensure consistency
  const firstMenuItem = await Menu.findById(items[0].menuId);
  if (!firstMenuItem) {
    const error = new Error("Invalid menu item in cart");
    error.statusCode = 400;
    throw error;
  }

  const chefId = firstMenuItem.chefId;

  // Validate that all items belong to the same chef
  for (const item of items) {
    const menuItem = await Menu.findById(item.menuId);
    if (!menuItem || menuItem.chefId.toString() !== chefId.toString()) {
      const error = new Error("All items in cart must belong to the same chef");
      error.statusCode = 400;
      throw error;
    }
  }

  // Find or create cart and overwrite with new items
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { userId: req.user._id, chefId, items },
    { returnDocument: "after", upsert: true, runValidators: true }
  ).populate("items.menuId");

  successResponse(res, 200, "Cart synchronized successfully", cart);
});

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user._id });
  successResponse(res, 200, "Cart cleared successfully");
});
