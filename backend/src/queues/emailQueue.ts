import { Queue } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { localEmailQueue } from '../lib/localQueue';

let isRedisAvailable = false;
let _emailQueue: Queue | null = null;

redisConnection.on('connect', () => {
    isRedisAvailable = true;
    console.log('BullMQ: Redis connected');
    if (!_emailQueue) {
        _emailQueue = new Queue('email-queue', {
            connection: redisConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: true,
            },
        });
    }
});

redisConnection.on('error', (err) => {
    isRedisAvailable = false;
    // We don't log the full error here as it's handled in redis.ts
});

export const emailQueue: any = {
    add: async (name: string, data: any, options: any) => {
        if (isRedisAvailable && _emailQueue) {
            return _emailQueue.add(name, data, options);
        } else {
            console.log(`[LocalQueue] Scheduling job: ${name}`);
            return localEmailQueue.add(name, data, options);
        }
    }
};

