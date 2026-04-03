import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/Order.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    const error = new Error("Amount is required");
    error.statusCode = 400;
    throw error;
  }

  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  console.log("Creating Razorpay Order with Options:", { ...options, amount: options.amount / 100 + " INR" });

  try {
    const order = await razorpay.orders.create(options);
    successResponse(res, 201, "Razorpay order created", order);
  } catch (error) {
    console.error("Razorpay error:", error);
    const err = new Error("Razorpay Order Creation Failed");
    err.statusCode = 500;
    throw err;
  }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature,
    orderId 
  } = req.body;

  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isVerified = expectedSignature === razorpaySignature;

  if (isVerified) {
    // Update order status in database
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    order.paymentStatus = "paid";
    await order.save();

    successResponse(res, 200, "Payment verified successfully", { order });
  } else {
    const error = new Error("Invalid signature, payment verification failed");
    error.statusCode = 400;
    throw error;
  }
});
