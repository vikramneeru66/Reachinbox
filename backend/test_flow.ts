async function test() {
  const userResp = await fetch('http://localhost:5000/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', name: 'Test User', googleId: 'test1' })
  });
  const user = (await userResp.json()) as any;
  console.log('User created:', user.id);

  const senderResp = await fetch('http://localhost:5000/api/sender/ethereal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id })
  });
  const sender = (await senderResp.json()) as any;
  console.log('Sender created:', sender.id);

  const campaignResp = await fetch('http://localhost:5000/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      name: 'Test Campaign',
      subject: 'Hello',
      body: 'World',
      startTime: new Date(),
      delay: 5,
      recipients: ['recipient@example.com'],
      senderId: sender.id
    })
  });
  const campaign = (await campaignResp.json()) as any;
  console.log('Campaign scheduled:', campaign.id);

  setTimeout(async () => {
    const scheduled = (await fetch(`http://localhost:5000/api/emails/scheduled?userId=${user.id}`).then(r => r.json())) as any[];
    console.log('Scheduled emails:', scheduled?.length);
    const sent = (await fetch(`http://localhost:5000/api/emails/sent?userId=${user.id}`).then(r => r.json())) as any[];
    console.log('Sent emails:', sent?.length);
  }, 2000);
}

test();
