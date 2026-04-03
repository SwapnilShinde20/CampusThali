import express from "express";
import { 
  getStats, 
  getAllUsers, 
  deleteUser, 
  getAllChefs, 
  updateChefStatus, 
  approveChef,
  rejectChef,
  getAllOrders 
} from "../controllers/admin.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(admin);

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/chefs", getAllChefs);
router.patch("/chefs/:id/status", updateChefStatus);
router.patch("/chefs/:id/approve", approveChef);
router.patch("/chefs/:id/reject", rejectChef);
router.get("/orders", getAllOrders);

export default router;
