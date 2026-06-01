import dotenv from 'dotenv';
dotenv.config();

import prisma from '../config/database.js';

(async () => {
  try {
    const email = 'bukopandan3216@gmail.com';
    console.log('Looking up user by email:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      process.exit(0);
    }
    console.log('User found:');
    console.log(JSON.stringify(user, null, 2));
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('DB check failed:', err);
    try { await prisma.$disconnect(); } catch (_) {}
    process.exit(1);
  }
})();
