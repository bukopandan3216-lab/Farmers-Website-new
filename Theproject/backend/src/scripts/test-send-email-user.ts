import dotenv from 'dotenv';
dotenv.config();

import { emailService } from '../config/email.js';

(async () => {
  try {
    const email = 'bukopandan3216@gmail.com';
    const phone = '09567842145';
    const fullName = 'Bukopandan Test';
    const role = 'BUYER';
    const notificationPreference: 'EMAIL' | 'PHONE' = 'EMAIL';
    const accountCreationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/create-account/test`;

    console.log('Sending test approval notification to', email);
    const ok = await emailService.sendApprovalNotification(
      email,
      phone,
      fullName,
      role,
      notificationPreference,
      accountCreationLink
    );

    console.log('sendApprovalNotification result:', ok);
    process.exit(ok ? 0 : 1);
  } catch (err) {
    console.error('Test send failed:', err);
    process.exit(1);
  }
})();
