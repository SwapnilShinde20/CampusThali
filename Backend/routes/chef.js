import express from 'express';
import { getChefs, getChef, getMe, updateProfile } from '../controllers/chef.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getChefs);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('image'), updateProfile);
router.get('/:id', getChef);

export default router;
