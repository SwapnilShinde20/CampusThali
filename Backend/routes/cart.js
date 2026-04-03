import express from "express";
import { getCart, syncCart, clearCart } from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // All cart routes are private

router.get("/", getCart);
router.post("/sync", syncCart);
router.delete("/", clearCart);

export default router;
