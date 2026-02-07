import { Worker, Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import prisma from '../lib/prisma';
import { EmailService } from '../services/emailService';
import { RateLimiter } from '../services/rateLimiter';
import { emailQueue } from '../queues/emailQueue';
import { localEmailQueue } from '../lib/localQueue';



const processJob = async (job: Job | any) => {
  const { emailJobId, senderId } = job.data;

  const emailJob = await prisma.emailJob.findUnique({
    where: { id: emailJobId },
    include: { campaign: true },
  });

  if (!emailJob || emailJob.status === 'SENT') {
    return;
  }

  const sender = await prisma.emailAccount.findUnique({
    where: { id: senderId },
  });

  if (!sender) {
    throw new Error(`Sender ${senderId} not found`);
  }

  const canSend = await RateLimiter.canSend(senderId, sender.hourlyLimit);

  if (!canSend) {
    const nextHour = new Date();
    nextHour.setUTCHours(nextHour.getUTCHours() + 1, 0, 0, 0);
    const delay = nextHour.getTime() - Date.now();
    
    await emailQueue.add(
      'retry-rate-limit',
      { emailJobId, senderId },
      { delay }
    );
    
    return { status: 'RATE_LIMITED', nextTry: nextHour };
  }

  try {
    await EmailService.sendEmail(
      {
        host: sender.host,
        port: sender.port,
        user: sender.user_auth,
        pass: sender.pass_auth,
        email: sender.email,
      },
      emailJob.recipient,
      emailJob.campaign.subject,
      emailJob.campaign.body
    );

    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    await prisma.sentEmail.create({
      data: {
        emailAccountId: senderId,
        recipient: emailJob.recipient,
        subject: emailJob.campaign.subject,
      },
    });

    await RateLimiter.increment(senderId);

    return { status: 'SUCCESS' };
  } catch (error: any) {
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: {
        status: 'FAILED',
        error: error.message,
      },
    });
    throw error;
  }
};

let emailWorker: Worker | null = null;

redisConnection.on('connect', () => {
  if (!emailWorker) {
    emailWorker = new Worker(
      'email-queue',
      processJob,
      {
        connection: redisConnection,
        concurrency: 5,
      }
    );

    emailWorker.on('completed', (job: Job) => {
      console.log(`Job ${job.id} completed`);
    });

    emailWorker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`Job ${job?.id} failed with ${err.message}`);
    });
    
    console.log('BullMQ: Worker started');
  }
});

// Setup local processor as well
localEmailQueue.setProcessor(processJob as any);
localEmailQueue.on('completed', () => console.log('[Local] Job completed'));
localEmailQueue.on('failed', (job: any, err: any) => console.error(`[Local] Job failed: ${err.message}`));

export { emailWorker };

