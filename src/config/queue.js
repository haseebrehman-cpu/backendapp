import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// BullMQ requires an ioredis connection with maxRetriesPerRequest set to null.
// The rediss:// URL enables TLS automatically (required by Upstash).
export const bullConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const EMAIL_QUEUE = 'email';
export const emailQueue = new Queue(EMAIL_QUEUE, { connection: bullConnection });