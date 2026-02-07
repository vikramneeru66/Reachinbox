import prisma from './src/lib/prisma';

async function check() {
  const users = await prisma.user.findMany();
  console.log('Users:', users.length);
  const accounts = await prisma.emailAccount.findMany();
  console.log('Accounts:', accounts.length);
  const campaigns = await prisma.campaign.findMany();
  console.log('Campaigns:', campaigns.length);
  const jobs = await prisma.emailJob.findMany();
  console.log('Jobs:', jobs.length);
  jobs.forEach(j => console.log(`Job ${j.id}: ${j.status}`));
  process.exit(0);
}

check();
