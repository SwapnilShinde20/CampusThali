import { asyncHandler } from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import ChefProfile from "../models/ChefProfile.js";
import Order from "../models/Order.js";

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  try {
    const totalUsers = (await User.countDocuments()) || 0;
    const totalChefs = (await User.countDocuments({ role: "chef" })) || 0;
    const totalOrders = (await Order.countDocuments()) || 0;
    
    const revenueData = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? (revenueData[0].total || 0) : 0;

    res.json({
      totalUsers,
      totalChefs,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching stats",
      totalUsers: 0,
      totalChefs: 0,
      totalOrders: 0,
      totalRevenue: 0
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort("-createdAt");
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all chefs
// @route   GET /api/admin/chefs
// @access  Private/Admin
export const getAllChefs = asyncHandler(async (req, res) => {
  const chefs = await ChefProfile.find({}).populate("userId", "name email").sort("-createdAt");
  res.json(chefs);
});

// @desc    Approve/Reject chef
// @route   PATCH /api/admin/chefs/:id/status
// @access  Private/Admin
export const updateChefStatus = asyncHandler(async (req, res) => {
  const chef = await ChefProfile.findById(req.params.id);

  if (chef) {
    chef.isApproved = req.body.isApproved;
    const updatedChef = await chef.save();
    res.json(updatedChef);
  } else {
    res.status(404);
    throw new Error("Chef profile not found");
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, paymentMethod } = req.query;
  const query = {};

  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;

  const orders = await Order.find(query)
    .populate("studentId", "name email")
    .populate("chefId", "name email")
    .sort("-createdAt");

  res.json(orders);
});

// @desc    Approve chef
// @route   PATCH /api/admin/chefs/:id/approve
// @access  Private/Admin
export const approveChef = asyncHandler(async (req, res) => {
  const chef = await ChefProfile.findById(req.params.id);

  if (chef) {
    chef.isApproved = true;
    const updatedChef = await chef.save();
    res.json(updatedChef);
  } else {
    res.status(404);
    throw new Error("Chef profile not found");
  }
});

// @desc    Reject/Suspend chef
// @route   PATCH /api/admin/chefs/:id/reject
// @access  Private/Admin
export const rejectChef = asyncHandler(async (req, res) => {
  const chef = await ChefProfile.findById(req.params.id);

  if (chef) {
    chef.isApproved = false;
    const updatedChef = await chef.save();
    res.json(updatedChef);
  } else {
    res.status(404);
    throw new Error("Chef profile not found");
  }
});
