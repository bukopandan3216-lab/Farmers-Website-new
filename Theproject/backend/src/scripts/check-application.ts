import dotenv from 'dotenv';
dotenv.config();

import prisma from '../config/database.js';

(async () => {
  try {
    const email = 'bukopandan3216@gmail.com';
    console.log('Looking up application by email:', email);
    const app = await prisma.application.findFirst({ where: { email } });
    if (!app) {
      console.log('Application not found for email:', email);
      process.exit(0);
    }
    console.log('Application found:');
    console.log(JSON.stringify(app, null, 2));
    const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/create-account/${app.id}`;
    console.log('Account creation link:', link);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('DB check failed:', err);
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(1);
  }
})();
