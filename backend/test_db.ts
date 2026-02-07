import prisma from './src/lib/prisma';

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    users.forEach(u => console.log(`User: ${u.email} (${u.id})`));
    const accounts = await prisma.emailAccount.findMany({
        include: { user: true }
    });
    console.log('Accounts:', accounts.length);
    const campaigns = await prisma.campaign.findMany();
    console.log('Campaigns:', campaigns.length);
    const jobs = await prisma.emailJob.findMany();
    console.log('Jobs:', jobs.length);
    jobs.forEach(j => console.log(`Job ${j.id}: ${j.status}`));
  } catch (err) {
    console.error('DB Check Error:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

check();
