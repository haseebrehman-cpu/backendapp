import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
})

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection failed', error);
    process.exit(1);
  }
}

const disconnectRedis = async () => {
  try {
    await redisClient.disconnect();
    console.log('Redis disconnected successfully');
  } catch (error) {
    console.error('Redis disconnection failed', error);
  }
}

export { connectRedis, disconnectRedis, redisClient };