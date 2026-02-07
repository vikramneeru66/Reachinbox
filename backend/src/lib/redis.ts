import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  showFriendlyErrorStack: true,
  lazyConnect: true // Don't crash on start
});

redisConnection.on('error', (err) => {
  console.warn('Redis Connection Error:', err.message);
  console.warn('Falling back to local in-memory processing for now...');
});

