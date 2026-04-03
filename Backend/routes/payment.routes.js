import express from "express";
import { createRazorpayOrder, verifyPayment } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyPayment);

export default router;
