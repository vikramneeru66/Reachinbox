import prisma from '../lib/prisma';
import { emailQueue } from '../queues/emailQueue';


export class CampaignService {
  static async scheduleCampaign(
    userId: string,
    data: {
      name: string;
      subject: string;
      body: string;
      startTime: string;
      delay: number; // in seconds
      recipients: string[];
      senderId: string;
    }
  ) {
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name: data.name,
        subject: data.subject,
        body: data.body,
        startTime: new Date(data.startTime),
        delay: data.delay,
      },
    });

    const jobs = data.recipients.map((recipient, index) => {
      const scheduledTime = new Date(
        new Date(data.startTime).getTime() + index * data.delay * 1000
      );

      return {
        recipient,
        campaignId: campaign.id,
        scheduledTime,
      };
    });

    await prisma.emailJob.createMany({
      data: jobs,
    });

    const createdJobs = await prisma.emailJob.findMany({
      where: { campaignId: campaign.id },
    });

    for (const job of createdJobs) {
      const delay = Math.max(0, job.scheduledTime.getTime() - Date.now());
      await emailQueue.add(
        'send-email',
        { emailJobId: job.id, senderId: data.senderId },
        { delay }
      );
    }

    return campaign;
  }
}
