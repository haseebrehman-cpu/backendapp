import express from 'express';
import { createProduct, getAllProducts } from '../controllers/productController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/create', verifyToken, createProduct);
router.get('/all', getAllProducts);

export default router;
