import express from 'express';
import {
  createItem,
  getItemsByChef,
  updateItem,
  deleteItem,
} from '../controllers/menu.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public route
router.get('/:chefId', getItemsByChef);

// Protected routes
router.post('/', protect, upload.single('image'), createItem);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);

export default router;