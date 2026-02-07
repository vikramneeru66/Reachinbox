import { redisConnection } from '../lib/redis';

const USE_REDIS = process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379' || false;
const localLimits = new Map<string, number>();

export class RateLimiter {
  static async canSend(senderId: string, limit: number): Promise<boolean> {
    const hourKey = this.getHourKey(senderId);
    
    if (USE_REDIS) {
      const count = await redisConnection.get(hourKey);
      if (!count) return true;
      return parseInt(count) < limit;
    } else {
      const count = localLimits.get(hourKey) || 0;
      return count < limit;
    }
  }

  static async increment(senderId: string): Promise<void> {
    const hourKey = this.getHourKey(senderId);
    
    if (USE_REDIS) {
      await redisConnection.incr(hourKey);
      const ttl = await redisConnection.ttl(hourKey);
      if (ttl === -1) {
        await redisConnection.expire(hourKey, 3600);
      }
    } else {
      const current = localLimits.get(hourKey) || 0;
      localLimits.set(hourKey, current + 1);
    }
  }

  private static getHourKey(senderId: string): string {
    const now = new Date();
    const hour = now.getUTCHours();
    const date = now.toISOString().split('T')[0];
    return `ratelimit:${senderId}:${date}:${hour}`;
  }
}

