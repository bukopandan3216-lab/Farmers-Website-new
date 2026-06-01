/*
import nodemailer from 'nodemailer';

// Create a transporter for sending emails
// Using environment variables for configuration
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
let usingEthereal = false;

export const emailService = {
  async sendApprovalEmail(email: string, fullName: string, role: string) {
    try {
      const subject = 'Your FarmDirect Account Has Been Approved!';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
            .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .highlight { color: #059669; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to FarmDirect! 🎉</h1>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${fullName}</span>,</p>
              
              <p>Great news! Your application for a <span class="highlight">${role === 'FARMER' ? 'Farmer/Seller' : 'Buyer'} Account</span> has been <span class="highlight">APPROVED</span>!</p>
              
              <p>You can now log in and access your FarmDirect account. Here's what you can do next:</p>
              
              ${role === 'FARMER' ? `
                <ul>
                  <li>Set up your farm store profile</li>
                  <li>Upload your products</li>
                  <li>Manage your inventory</li>
                  <li>Track orders and earnings</li>
                  <li>Connect with buyers</li>
                </ul>
              ` : `
                <ul>
                  <li>Browse products from local farmers</li>
                  <li>Add items to your cart</li>
                  <li>Place orders</li>
                  <li>Track your purchases</li>
                  <li>Leave reviews</li>
                </ul>
              `}
              
              <p>
                <a href="${process.env.FRONTEND_URL || 'https://farmdirect.com'}/login" class="button">
                  Login to Your Account
                </a>
              </p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Happy farming and shopping!</p>
              
              <p>Best regards,<br><strong>The FarmDirect Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2026 FarmDirect. All rights reserved.</p>
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@farmdirect.com',
        to: email,
        subject,
        html: htmlContent,
      });

      if (usingEthereal) {
        console.log('Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return true;
    } catch (error) {
      console.error('Error sending approval email:', error);
      // Don't throw error - email service should not block application flow
      return false;
    }
  },

  async sendApprovalEmailWithLink(email: string, fullName: string, role: string, accountCreationLink: string) {
    try {
      const subject = 'Create Your FarmDirect Account - Application Approved!';
      const htmlContent = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
          .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .highlight { color: #059669; font-weight: bold; }
          .link-box { background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Application is Approved! 🎉</h1>
          </div>
          <div class="content">
            <p>Dear <span class="highlight">${fullName}</span>,</p>
            <p>Excellent news! Your <span class="highlight">${role === 'FARMER' ? 'Farmer/Seller' : 'Buyer'}</span> application has been <span class="highlight">APPROVED</span>!</p>
            <p>Now it's time to create your account and get started on FarmDirect. Click the button below to set up your password and complete your account creation:</p>
            <div style="text-align:center">
              <a href="${accountCreationLink}" class="button">Create Your Account</a>
            </div>
            <div class="link-box">
              <p><strong>Having trouble with the button?</strong> Copy and paste this link in your browser:</p>
              <p style="color:#059669">${accountCreationLink}</p>
            </div>
            <p>Once you create your account, you'll be able to:</p>
            ${role === 'FARMER' ? `
              <ul>
                <li>Set up your farm store profile</li>
                <li>Upload your products</li>
                <li>Manage your inventory</li>
                <li>Track orders and earnings</li>
                <li>Connect with buyers</li>
              </ul>
            ` : `
              <ul>
                <li>Browse products from local farmers</li>
                <li>Add items to your cart</li>
                <li>Place orders</li>
                <li>Track your purchases</li>
                <li>Leave reviews</li>
              </ul>
            `}
            <p>This link will be valid for 30 days. If you need any assistance, please contact our support team.</p>
            <p>Welcome to FarmDirect!</p>
            <p>Best regards,<br><strong>The FarmDirect Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2026 FarmDirect. All rights reserved.</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>`;

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'FarmDirect <noreply@farmdirect.com>',
        to: email,
        subject,
        html: htmlContent,
        headers: {
          'Return-Path': process.env.SMTP_FROM || 'noreply@farmdirect.com',
          'Content-Transfer-Encoding': 'quoted-printable',
        },
        envelope: {
          from: process.env.SMTP_FROM || 'noreply@farmdirect.com',
          to: email,
        },
      });

      if (usingEthereal) {
        console.log('Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return true;
    } catch (error) {
      console.error('Error sending approval email with link:', error);
      return false;
    }
  },

  async sendSmsNotification(phone: string, fullName: string, role: string) {
    try {
      const message = `Hello ${fullName}, your FarmDirect application is approved. You can now log in at ${process.env.FRONTEND_URL || 'https://farmdirect.com'}/login.`;
      if (!process.env.SMS_PROVIDER_API_KEY) {
        console.info(`SMS placeholder to ${phone}: ${message}`);
        return true;
      }

      // TODO: integrate with SMS provider using SMS_PROVIDER_API_KEY
      console.info(`SMS sent to ${phone}: ${message}`);
      return true;
    } catch (error) {
      console.error('Error sending approval SMS:', error);
      return false;
    }
  },

  async sendSmsCrateAccountNotification(phone: string, fullName: string, accountCreationLink: string) {
    try {
      const message = `Hello ${fullName}, your FarmDirect application is approved! Create your account here: ${accountCreationLink}`;
      if (!process.env.SMS_PROVIDER_API_KEY) {
        console.info(`SMS placeholder to ${phone}: ${message}`);
        return true;
      }

      // TODO: integrate with SMS provider using SMS_PROVIDER_API_KEY
      console.info(`SMS sent to ${phone}: ${message}`);
      return true;
    } catch (error) {
      console.error('Error sending account creation SMS:', error);
      return false;
    }
  },

  async sendApprovalNotification(
    email: string,
    phone: string,
    fullName: string,
    role: string,
    notificationPreference: 'EMAIL' | 'PHONE',
    accountCreationLink: string
  ) {
    // Ensure transporter is configured; if SMTP is absent, fall back to Ethereal.
    try {
      const info = await transporter.verify().catch(() => null);
      if (!info) {
        const testAcct = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: testAcct.smtp.host,
          port: testAcct.smtp.port,
          secure: testAcct.smtp.secure,
          auth: { user: testAcct.user, pass: testAcct.pass },
        });
        usingEthereal = true;
        console.warn('No SMTP configured; using Ethereal test account. Preview URLs will be logged.');
      }
    } catch (e) {
      console.warn('Failed to verify transporter, attempting to create Ethereal account', e);
      const testAcct = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAcct.smtp.host,
        port: testAcct.smtp.port,
        secure: testAcct.smtp.secure,
        auth: { user: testAcct.user, pass: testAcct.pass },
      });
      usingEthereal = true;
    }
    // Respect the user's notification preference: EMAIL or PHONE
    if (notificationPreference === 'PHONE' && phone) {
      return await this.sendSmsCrateAccountNotification(phone, fullName, accountCreationLink);
    }

    // Default or EMAIL preference: send email only
    return await this.sendApprovalEmailWithLink(email, fullName, role, accountCreationLink);
  },

  async sendRejectionEmail(email: string, fullName: string, rejectionReason: string) {
    try {
      const subject = 'FarmDirect Application Status Update';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
            .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .highlight { color: #dc2626; font-weight: bold; }
            .reason-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Status Update</h1>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${fullName}</span>,</p>
              
              <p>Thank you for applying to FarmDirect. We appreciate your interest in joining our community.</p>
              
              <p>Unfortunately, your application has been <span class="highlight">REJECTED</span> at this time.</p>
              
              <div class="reason-box">
                <strong>Reason for rejection:</strong>
                <p>${rejectionReason}</p>
              </div>
              
              <p>Please review the reason above. If you would like to appeal this decision or have questions, please contact our support team at <strong>support@farmdirect.com</strong>.</p>
              
              <p>We encourage you to reapply in the future if you can address the concerns mentioned above.</p>
              
              <p>Best regards,<br><strong>The FarmDirect Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2026 FarmDirect. All rights reserved.</p>
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@farmdirect.com',
        to: email,
        subject,
        html: htmlContent,
      });

      if (usingEthereal) {
        console.log('Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return true;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      // Don't throw error - email service should not block application flow
      return false;
    }
  },

  // Check if email service is properly configured
  async testConnection() {
    try {
      const ok = await transporter.verify().catch(() => false);
      if (ok) {
        console.log('Email service is ready to send emails');
        return true;
      }

      // create ethereal test account as fallback
      const testAcct = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAcct.smtp.host,
        port: testAcct.smtp.port,
        secure: testAcct.smtp.secure,
        auth: { user: testAcct.user, pass: testAcct.pass },
      });
      usingEthereal = true;
      console.log('Using Ethereal test account for emails. Credentials:', { user: testAcct.user, pass: testAcct.pass });
      return true;
    } catch (error) {
      console.error('Email service test failed:', error);
      return false;
    }
  },
};
*/



import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// SMTP transporter — initialised once at startup.
// If real SMTP creds are present they are used; otherwise we fall back to
// Ethereal so the server still starts in development without a mail server.
// ---------------------------------------------------------------------------

let transporter: nodemailer.Transporter;
let usingEthereal = false;

async function initTransporter() {
  const hasRealSmtp =
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== 'your-gmail-address@gmail.com' &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_PASSWORD !== 'your-16-char-app-password' &&
    process.env.SMTP_USER !== 'your_smtp_user';

  if (hasRealSmtp) {
    transporter = nodemailer.createTransport({
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
      console.log('✅ Email service connected via SMTP:', process.env.SMTP_USER);
      usingEthereal = false;
    } catch (err) {
      console.error('❌ SMTP verify failed — check SMTP_USER / SMTP_PASSWORD in .env:', err);
      // Fall back to Ethereal so the server still runs
      await fallbackToEthereal();
    }
  } else {
    console.warn('⚠️  No real SMTP credentials found. Falling back to Ethereal (dev-only preview emails).');
    await fallbackToEthereal();
  }
}

async function fallbackToEthereal() {
  try {
    const testAcct = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAcct.smtp.host,
      port: testAcct.smtp.port,
      secure: testAcct.smtp.secure,
      auth: { user: testAcct.user, pass: testAcct.pass },
    });
    usingEthereal = true;
    console.warn('📧 Using Ethereal test account. Preview URLs will be logged on each send.');
    console.warn('   Set SMTP_USER and SMTP_PASSWORD in backend/.env to send real emails.');
  } catch (err) {
    console.error('Could not create Ethereal fallback account:', err);
  }
}

// Initialise immediately — the promise is awaited by app startup indirectly
// because all sends call getTransporter() which awaits the init promise.
const initPromise = initTransporter();

async function getTransporter(): Promise<nodemailer.Transporter> {
  await initPromise;
  return transporter;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function logPreview(info: any) {
  if (usingEthereal) {
    console.log('📬 Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
  }
}

const baseStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 20px; }
  .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
  .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
  .highlight { color: #059669; font-weight: bold; }
  .link-box { background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; word-break: break-all; }
`;

const footer = `
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} FarmDirect. All rights reserved.</p>
    <p>This is an automated message. Please do not reply directly to this email.</p>
  </div>
`;

// ---------------------------------------------------------------------------
// Email service
// ---------------------------------------------------------------------------

export const emailService = {

  // ── Approval email WITH account-creation link (token-based flow) ──────────
  async sendApprovalNotification(
    email: string,
    phone: string,
    fullName: string,
    role: string,
    notificationPreference: 'EMAIL' | 'PHONE',
    accountCreationLink: string
  ) {
    // PHONE preference → SMS placeholder (no real SMS provider yet)
    if (notificationPreference === 'PHONE' && phone) {
      return this.sendSmsCrateAccountNotification(phone, fullName, accountCreationLink);
    }
    return this.sendApprovalEmailWithLink(email, fullName, role, accountCreationLink);
  },

  async sendApprovalEmailWithLink(
    email: string,
    fullName: string,
    role: string,
    accountCreationLink: string
  ) {
    try {
      const t = await getTransporter();
      const farmerBullets = `
        <ul>
          <li>Set up your farm store profile</li>
          <li>Upload and manage your products</li>
          <li>Track orders and earnings</li>
          <li>Connect with buyers</li>
        </ul>`;
      const buyerBullets = `
        <ul>
          <li>Browse products from local farmers</li>
          <li>Add items to your cart and place orders</li>
          <li>Track your purchases</li>
          <li>Leave reviews</li>
        </ul>`;

      const ttlDays = parseInt(process.env.REGISTRATION_TOKEN_TTL_DAYS || '30', 10);
      const html = `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
        <div class="container">
          <div class="header"><h1>Your Application is Approved! 🎉</h1></div>
          <div class="content">
            <p>Dear <span class="highlight">${fullName}</span>,</p>
            <p>Excellent news! Your <span class="highlight">${role === 'FARMER' ? 'Farmer/Seller' : 'Buyer'}</span> application has been <span class="highlight">APPROVED</span>!</p>
            <p>Click the button below to set your password and activate your account:</p>
            <div style="text-align:center">
              <a href="${accountCreationLink}" class="button">Create Your Account →</a>
            </div>
            <div class="link-box">
              <strong>Button not working?</strong> Copy and paste this link:<br>
              <span style="color:#059669">${accountCreationLink}</span>
            </div>
            <p><strong>⚠️ This link expires in ${ttlDays} day${ttlDays > 1 ? 's' : ''}.</strong></p>
            <p>Once your account is active you can:</p>
            ${role === 'FARMER' ? farmerBullets : buyerBullets}
            <p>Welcome to FarmDirect!</p>
            <p>Best regards,<br><strong>The FarmDirect Team</strong></p>
          </div>
          ${footer}
        </div>
      </body></html>`;

      // Plain-text fallback for mail clients that prefer or strip HTML
      const text = `Your application has been approved!\n\nPlease open the following link to create your account (link expires in ${ttlDays} day${ttlDays > 1 ? 's' : ''}):\n\n${accountCreationLink}\n\nIf the button above doesn't work, copy and paste the link into your browser.`;

      const info = await t.sendMail({
        from: process.env.SMTP_FROM || 'FarmDirect <noreply@farmdirect.com>',
        to: email,
        subject: 'Create Your FarmDirect Account — Application Approved!',
        text,
        html,
      });

      logPreview(info);
      return true;
    } catch (error) {
      console.error('Error sending approval email with link:', error);
      return false;
    }
  },

  // ── Simple approval email (no token link — legacy) ────────────────────────
  async sendApprovalEmail(email: string, fullName: string, role: string) {
    try {
      const t = await getTransporter();
      const html = `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
        <div class="container">
          <div class="header"><h1>Welcome to FarmDirect! 🎉</h1></div>
          <div class="content">
            <p>Dear <span class="highlight">${fullName}</span>,</p>
            <p>Great news! Your <span class="highlight">${role === 'FARMER' ? 'Farmer/Seller' : 'Buyer'} Account</span> has been <span class="highlight">APPROVED</span>!</p>
            <p><a href="${process.env.FRONTEND_URL || 'https://farmdirect.com'}/login" class="button">Login to Your Account</a></p>
            <p>Best regards,<br><strong>The FarmDirect Team</strong></p>
          </div>
          ${footer}
        </div>
      </body></html>`;

      const info = await t.sendMail({
        from: process.env.SMTP_FROM || 'noreply@farmdirect.com',
        to: email,
        subject: 'Your FarmDirect Account Has Been Approved!',
        html,
      });
      logPreview(info);
      return true;
    } catch (error) {
      console.error('Error sending approval email:', error);
      return false;
    }
  },

  // ── Rejection email ───────────────────────────────────────────────────────
  async sendRejectionEmail(email: string, fullName: string, rejectionReason: string) {
    try {
      const t = await getTransporter();
      const rejectionStyles = `
        .header-red { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .highlight-red { color: #dc2626; font-weight: bold; }
        .reason-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
      `;
      const html = `<!DOCTYPE html><html><head><style>${baseStyles}${rejectionStyles}</style></head><body>
        <div class="container">
          <div class="header-red"><h1>Application Status Update</h1></div>
          <div class="content">
            <p>Dear <span class="highlight-red">${fullName}</span>,</p>
            <p>Thank you for applying to FarmDirect. Unfortunately, your application has been <span class="highlight-red">REJECTED</span> at this time.</p>
            <div class="reason-box"><strong>Reason:</strong><p>${rejectionReason}</p></div>
            <p>If you have questions, contact us at <strong>support@farmdirect.com</strong>.</p>
            <p>Best regards,<br><strong>The FarmDirect Team</strong></p>
          </div>
          ${footer}
        </div>
      </body></html>`;

      const info = await t.sendMail({
        from: process.env.SMTP_FROM || 'noreply@farmdirect.com',
        to: email,
        subject: 'FarmDirect Application Status Update',
        html,
      });
      logPreview(info);
      return true;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return false;
    }
  },

  // ── SMS placeholder ───────────────────────────────────────────────────────
  async sendSmsNotification(phone: string, fullName: string, role: string) {
    const message = `Hello ${fullName}, your FarmDirect application is approved. Log in at ${process.env.FRONTEND_URL || 'https://farmdirect.com'}/login.`;
    console.info(`[SMS placeholder] To ${phone}: ${message}`);
    return true;
  },

  async sendSmsCrateAccountNotification(phone: string, fullName: string, accountCreationLink: string) {
    const message = `Hello ${fullName}, your FarmDirect application is approved! Create your account: ${accountCreationLink}`;
    console.info(`[SMS placeholder] To ${phone}: ${message}`);
    return true;
  },

  // ── Connection test ───────────────────────────────────────────────────────
  async testConnection() {
    await initPromise;
    return !usingEthereal;
  },
};
