import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

async function main() {
  const applicationId = process.argv[2];
  const emailOverride = process.argv[3];

  if (!applicationId) {
    console.error('Usage: node generate_registration_token_and_send.mjs <applicationId> [emailOverride]');
    process.exit(1);
  }

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) {
    console.error('Application not found:', applicationId);
    process.exit(1);
  }

  let user = await prisma.user.findUnique({ where: { email: application.email } });

  if (!user) {
    // create a placeholder user record so token can reference it
    const placeholderPassword = crypto.randomBytes(24).toString('hex');
    const placeholderHash = crypto.createHash('sha256').update(placeholderPassword).digest('hex');
    user = await prisma.user.create({
      data: {
        email: application.email,
        fullName: application.fullName,
        passwordHash: placeholderHash,
        phone: application.phone || null,
        address: application.address || null,
        avatar: application.profileImageUrl || null,
        role: application.role,
        accountSetupCompleted: false,
        cart: { create: {} },
      },
    });
    console.log('Created placeholder user:', user.id);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const reg = await prisma.registrationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const accountCreationLink = `${frontendUrl}/create-account?token=${token}`;

  // create transporter (same defaults as email service)
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
  } catch (e) {
    const testAcct = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAcct.smtp.host,
      port: testAcct.smtp.port,
      secure: testAcct.smtp.secure,
      auth: { user: testAcct.user, pass: testAcct.pass },
    });
    console.warn('No SMTP configured; using Ethereal test account. Preview URL will be logged.');
  }

  const subject = 'Create Your FarmDirect Account - Application Approved!';
  const html = `<!doctype html>
  <html><body>
    <p>Dear ${application.fullName},</p>
    <p>Your application has been approved. Create your account by visiting the link below:</p>
    <p><a href="${accountCreationLink}">Create your FarmDirect account</a></p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break:break-all">${accountCreationLink}</p>
    <p>Link expires in 24 hours.</p>
    <p>— FarmDirect</p>
  </body></html>`;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@farmdirect.com',
    to: emailOverride || application.email,
    subject,
    html,
  });

  console.log('Registration token created:', reg.id);
  console.log('Token (secret):', token);
  if (nodemailer.getTestMessageUrl(info)) {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
