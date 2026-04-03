import * as orderService from "../services/order.service.js";
import { generateInvoicePDF } from "../services/invoice.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import Order from "../models/Order.js";

// @desc    Download Order Invoice (PDF)
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("studentId", "name email")
    .populate("chefId", "name email");

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  // Security: Only student or chef of this order can download
  const isStudent = order.studentId._id.toString() === req.user._id.toString();
  const isChef = order.chefId._id.toString() === req.user._id.toString();

  if (!isStudent && !isChef) {
    const error = new Error("Unauthorized to access this invoice");
    error.statusCode = 403;
    throw error;
  }

  // Final check: Invoice only available after delivery
  if (order.status !== "delivered") {
    const error = new Error("Invoice is only available after successful delivery");
    error.statusCode = 400;
    throw error;
  }

  const doc = generateInvoicePDF(order);
  const filename = `Invoice_${order._id.toString().slice(-8).toUpperCase()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);
  doc.end();
});

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Student/Chef/Admin)
export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  successResponse(res, 201, "Order placed successfully", order);
});

// @desc    Get student's own orders
// @route   GET /api/orders/my
// @access  Private (Student)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getStudentOrders(req.user._id);
  successResponse(res, 200, "Orders retrieved successfully", orders);
});

// @desc    Get chef's orders (orders placed with them)
// @route   GET /api/orders/chef
// @access  Private (Chef)
export const getChefOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getChefOrders(req.user._id);
  successResponse(res, 200, "Chef orders retrieved successfully", orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Chef)
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, req.user._id, status);
  successResponse(res, 200, "Order status updated", order);
});
