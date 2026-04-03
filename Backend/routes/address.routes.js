import express from "express";
import {
  createItem,
  getMyAddresses,
  editItem,
  makeDefault,
  removeItem,
} from "../controllers/address.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // All address routes are private

router.route("/")
  .post(createItem)
  .get(getMyAddresses);

router.route("/:id")
  .patch(editItem)
  .delete(removeItem);

router.patch("/:id/default", makeDefault);

export default router;
