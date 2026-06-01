import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient, Role, ApplicationStatus } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const fullName = process.argv[3] || 'Placeholder User';
  if (!email) {
    console.error('Usage: node create_application_and_send_token.mjs <email> [fullName]');
    process.exit(1);
  }

  // Create or get an application
  let application = await prisma.application.findUnique({ where: { email } });
  if (!application) {
    application = await prisma.application.create({
      data: {
        fullName,
        email,
        phone: '',
        address: '',
        role: Role.FARMER,
        notificationPreference: 'EMAIL',
        status: ApplicationStatus.PENDING,
      },
    });
    console.log('Created application:', application.id);
  } else {
    console.log('Using existing application:', application.id);
  }

  // Create placeholder user
  const placeholderPassword = crypto.randomBytes(24).toString('hex');
  const placeholderHash = crypto.createHash('sha256').update(placeholderPassword).digest('hex');
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: application.email,
        fullName: application.fullName,
        passwordHash: placeholderHash,
        role: Role.FARMER,
        accountSetupCompleted: false,
        cart: { create: {} },
      },
    });
    console.log('Created placeholder user:', user.id);
  } else {
    console.log('Using existing user:', user.id);
  }

  // Mark application approved
  await prisma.application.update({ where: { id: application.id }, data: { status: ApplicationStatus.APPROVED } });

  // Create registration token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const reg = await prisma.registrationToken.create({ data: { token, userId: user.id, expiresAt } });
  console.log('Created registration token:', reg.id);

  // Send email
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const accountCreationLink = `${frontendUrl}/create-account?token=${token}`;

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

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@farmdirect.com',
    to: email,
    subject: 'Create Your FarmDirect Account - Application Approved!',
    html: `<p>Hi ${fullName},</p><p>Create your account: <a href="${accountCreationLink}">${accountCreationLink}</a></p>`,
  });

  console.log('Email sent.');
  if (nodemailer.getTestMessageUrl(info)) console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
