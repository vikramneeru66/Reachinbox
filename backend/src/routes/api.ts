import { Router } from 'express';
import prisma from '../lib/prisma';
import { CampaignService } from '../services/campaignService';
import { EmailService } from '../services/emailService';

const router = Router();

router.post('/auth/google', async (req, res) => {
  try {
    const { email, name, avatar, googleId } = req.body;
    
    // Check if user exists by email first to avoid unique constraint failures
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      // Update existing user with new info if needed
      user = await prisma.user.update({
        where: { email },
        data: { name, avatar, googleId }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: { email, name, avatar, googleId }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/senders', async (req, res) => {
  const { userId } = req.query;
  const senders = await prisma.emailAccount.findMany({
    where: { userId: userId as string }
  });
  res.json(senders);
});

router.post('/sender/ethereal', async (req, res) => {
  const { userId } = req.body;
  const testAccount = await EmailService.createTestAccount();
  
  const sender = await prisma.emailAccount.create({
    data: {
      userId,
      email: testAccount.user,
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      user_auth: testAccount.user,
      pass_auth: testAccount.pass,
      hourlyLimit: 10
    }
  });

  res.json(sender);
});

router.post('/campaigns', async (req, res) => {
  const { userId, name, subject, body, startTime, delay, recipients, senderId } = req.body;
  
  const campaign = await CampaignService.scheduleCampaign(userId, {
    name, subject, body, startTime, delay, recipients, senderId
  });

  res.json(campaign);
});

// Stats/Listings
router.get('/emails/scheduled', async (req, res) => {
  const { userId } = req.query;
  const emails = await prisma.emailJob.findMany({
    where: {
      campaign: { userId: userId as string },
      status: 'PENDING',
      isArchived: false
    },
    include: { campaign: true },
    orderBy: { scheduledTime: 'asc' }
  });
  res.json(emails);
});

router.get('/emails/sent', async (req, res) => {
  const { userId } = req.query;
  const emails = await prisma.emailJob.findMany({
    where: {
      campaign: { userId: userId as string },
      status: 'SENT',
      isArchived: false
    },
    include: { campaign: true },
    orderBy: { sentAt: 'desc' }
  });
  res.json(emails);
});

router.get('/emails/archived', async (req, res) => {
  const { userId } = req.query;
  const emails = await prisma.emailJob.findMany({
    where: {
      campaign: { userId: userId as string },
      isArchived: true
    },
    include: { campaign: true },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(emails);
});

router.get('/stats', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const scheduled = await prisma.emailJob.count({
        where: { campaign: { userId: userId as string }, status: 'PENDING', isArchived: false }
    });
    const sent = await prisma.emailJob.count({
        where: { campaign: { userId: userId as string }, status: 'SENT', isArchived: false }
    });
    const archived = await prisma.emailJob.count({
        where: { campaign: { userId: userId as string }, isArchived: true }
    });

    res.json({ scheduled, sent, archived });
});

router.patch('/emails/:id', async (req, res) => {
    const { id } = req.params;
    const { isStarred, isArchived, status } = req.body;
    
    try {
        const updated = await prisma.emailJob.update({
            where: { id },
            data: { 
                ...(isStarred !== undefined && { isStarred }),
                ...(isArchived !== undefined && { isArchived }),
                ...(status !== undefined && { status })
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

router.delete('/emails/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.emailJob.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

router.get('/emails/all', async (req, res) => {
    const { userId } = req.query;
    const emails = await prisma.emailJob.findMany({
        where: {
            campaign: { userId: userId as string },
            isArchived: false
        },
        include: { campaign: true },
        orderBy: { updatedAt: 'desc' }
    });
    res.json(emails);
});

export default router;
