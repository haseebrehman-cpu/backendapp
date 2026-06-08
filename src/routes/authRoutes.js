import express from 'express';
import authController from '../controllers/authController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', upload.single('profilePicture'), authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/verify-email', authController.verifyEmail);

export default router;