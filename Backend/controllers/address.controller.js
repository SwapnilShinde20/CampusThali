import {
  addAddress,
  getAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../services/address.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// @desc    Add a new address
// @route   POST /api/address
// @access  Private
export const createItem = asyncHandler(async (req, res) => {
  const address = await addAddress(req.user.id, req.body);
  successResponse(res, 201, "Address added successfully", address);
});

// @desc    Get all addresses for a user
// @route   GET /api/address
// @access  Private
export const getMyAddresses = asyncHandler(async (req, res) => {
  const addresses = await getAddresses(req.user.id);
  successResponse(res, 200, "Addresses retrieved successfully", addresses);
});

// @desc    Update an address
// @route   PATCH /api/address/:id
// @access  Private
export const editItem = asyncHandler(async (req, res) => {
  const address = await updateAddress(req.params.id, req.user.id, req.body);
  successResponse(res, 200, "Address updated successfully", address);
});

// @desc    Set default address
// @route   PATCH /api/address/:id/default
// @access  Private
export const makeDefault = asyncHandler(async (req, res) => {
  const address = await setDefaultAddress(req.params.id, req.user.id);
  successResponse(res, 200, "Address set as default", address);
});

// @desc    Delete an address
// @route   DELETE /api/address/:id
// @access  Private
export const removeItem = asyncHandler(async (req, res) => {
  await deleteAddress(req.params.id, req.user.id);
  successResponse(res, 200, "Address deleted successfully");
});
