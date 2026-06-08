import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully via Prisma');
  } catch (error) {
    console.log('Database connection failed', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully via Prisma');
  } catch (error) {
    console.log('Database disconnection failed', error);
  }
};

export { prisma, connectDB, disconnectDB };