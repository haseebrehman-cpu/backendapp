import express from 'express';
import userController from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();
router.get('/me', verifyToken, userController.getUserProfile);

export default router;