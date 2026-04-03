import express from "express";
import { 
  createOrder, 
  getMyOrders, 
  getChefOrders, 
  updateStatus,
  downloadInvoice 
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All order routes are protected
router.use(protect);

router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/chef", getChefOrders);
router.put("/:id/status", updateStatus);
router.get("/:id/invoice", downloadInvoice);

export default router;
