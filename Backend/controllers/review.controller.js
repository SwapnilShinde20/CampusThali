import Review from "../models/Review.js";
import Order from "../models/Order.js";
import { updateChefRating } from "../services/review.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// @desc    Add a Review
// @route   POST /api/reviews
// @access  Private (Student)
export const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;
  const studentId = req.user._id;

  // 1. Fetch order and verify
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Authorization: Only student of this order can review
  if (order.studentId.toString() !== studentId.toString()) {
    const error = new Error("Unauthorized to review this order");
    error.statusCode = 403;
    throw error;
  }

  // 3. Status check: Only delivered orders can be reviewed
  if (order.status !== "delivered") {
    const error = new Error("Review only available after delivery");
    error.statusCode = 400;
    throw error;
  }

  // 4. Duplicate check: Only one review per order
  const existingReview = await Review.findOne({ orderId });
  if (existingReview) {
    const error = new Error("Order has already been reviewed");
    error.statusCode = 400;
    throw error;
  }

  // 5. Save review
  const review = await Review.create({
    studentId,
    chefId: order.chefId,
    orderId,
    rating,
    comment,
    image: req.file ? `uploads/reviews/${req.file.filename}` : null,
  });

  // 6. Async update chef overall rating
  await updateChefRating(order.chefId);

  successResponse(res, 201, "Review submitted", review);
});

// @desc    Get Reviews for a Chef
// @route   GET /api/reviews/chef/:chefId
// @access  Public
export const getChefReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ chefId: req.params.chefId })
    .populate("studentId", "name avatar")
    .sort("-createdAt");

  const formatted = reviews.map(r => ({
    _id: r._id,
    rating: r.rating,
    comment: r.comment,
    image: r.image,
    studentName: r.studentId?.name || "Premium Student",
    studentAvatar: r.studentId?.avatar,
    createdAt: r.createdAt
  }));

  successResponse(res, 200, "Reviews fetched", formatted);
});
