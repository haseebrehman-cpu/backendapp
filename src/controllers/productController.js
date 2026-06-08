import { prisma } from '../config/db.js';
import { redisClient } from '../config/redis.js';
import { emailQueue } from '../config/queue.js';

const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    if (!name || !description || !price || !quantity || !category) return res.status(400).json({ message: 'All fields are required', status: 'error', code: 400 });

    const newProduct = await prisma.product.create({
      data: { name, description, price, quantity, category, createdBy: req.user.id },
      include: {
        addedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Cache individual product by id (no password exposed)
    await redisClient.set(`product:${newProduct.id}`, JSON.stringify(newProduct));

    // Invalidate the AllProducts cache so the next list request re-fetches fresh data
    await redisClient.del('AllProducts');

    await emailQueue.add('sendProductAddedEmail', newProduct);

    return res.status(201).json({ message: 'Product created successfully', status: 'success', code: 201, data: newProduct });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 'error', code: 500 });
  }
}

const getAllProducts = async (req, res) => {
  try {
    // Check cache first before hitting the DB
    const cachedProducts = await redisClient.get('AllProducts');
    if (cachedProducts) {
      return res.status(200).json({ message: 'Products fetched successfully', source: 'redis', status: 'success', code: 200, data: JSON.parse(cachedProducts) });
    }

    const products = await prisma.product.findMany({
      include: {
        addedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!products.length) return res.status(404).json({ message: 'No products found', status: 'error', code: 404 });

    await redisClient.set('AllProducts', JSON.stringify(products));

    return res.status(200).json({ message: 'Products fetched successfully', source: 'database', status: 'success', code: 200, data: products });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 'error', code: 500, data: null });
  }
}

export { createProduct, getAllProducts };