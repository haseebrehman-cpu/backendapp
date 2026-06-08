import 'dotenv/config';
import express from 'express';
import movieRoutes from './routes/movieRoutes.js';
import { connectDB, disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import './workers/emailWorker.js';
connectDB();
connectRedis();

const app = express();

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/products', productRoutes);

// Global error handler (catches errors passed via next(err), e.g. multer/cloudinary)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  return res.status(err.http_code || err.status || 500).json({
    message: err.message || 'Internal server error',
    status: 'error',
    code: err.http_code || err.status || 500,
  });
});

// In production (Vercel), the platform handles HTTP — just export the app.
// For local dev, start a regular server.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  process.on('unhandledRejection', async (error) => {
    console.log('Unhandled promise rejection: ', error);
    server.close(async () => {
      await disconnectDB();
    });
    process.exit(1);
  });

  process.on('uncaughtException', async (error) => {
    console.log('Uncaught exception: ', error);
    await disconnectDB();
    process.exit(1);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: shutting down gracefully');
    await disconnectDB();
    await disconnectRedis();
    process.exit(0);
  });
}

export default app;