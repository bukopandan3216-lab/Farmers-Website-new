const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const FROM_EMAIL = 'bukopandan3216@gmail.com';
const FROM_NAME = 'FarmDirect';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://farmers-website-new.vercel.app').replace(/\/$/, '');
const TTL_DAYS = parseInt(process.env.REGISTRATION_TOKEN_TTL_DAYS || '30', 10);

async function sendEmail(to: string, toName: string, subject: string, html: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent: html,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.error('Brevo error:', err);
      return false;
    }
    console.log('Email sent to:', to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export const emailService = {

  async sendApprovalNotification(
    email: string, phone: string, fullName: string,
    role: string, notificationPreference: 'EMAIL' | 'PHONE',
    accountCreationLink: string
  ) {
    if (notificationPreference === 'PHONE' && phone) {
      return this.sendSmsCrateAccountNotification(phone, fullName, accountCreationLink);
    }
    return this.sendApprovalEmailWithLink(email, fullName, role, accountCreationLink);
  },

  async sendApprovalEmailWithLink(email: string, fullName: string, role: string, accountCreationLink: string) {
    const html = '<p>Dear ' + fullName + ', your ' + (role === 'FARMER' ? 'Farmer/Seller' : 'Buyer') + ' application has been APPROVED!</p><p><a href="' + accountCreationLink + '">Click here to create your account</a></p><p>Link expires in ' + TTL_DAYS + ' days.</p>';
    return sendEmail(email, fullName, 'Create Your FarmDirect Account - Application Approved!', html);
  },

  async sendApprovalEmail(email: string, fullName: string, role: string) {
    const html = '<p>Dear ' + fullName + ', your account has been approved! <a href="' + FRONTEND_URL + '/login">Login here</a>.</p>';
    return sendEmail(email, fullName, 'Your FarmDirect Account Has Been Approved!', html);
  },

  async sendRejectionEmail(email: string, fullName: string, rejectionReason: string) {
    const html = '<p>Dear ' + fullName + ', your application has been rejected.</p><p>Reason: ' + rejectionReason + '</p>';
    return sendEmail(email, fullName, 'FarmDirect Application Status Update', html);
  },

  async sendSmsNotification(phone: string, fullName: string, role: string) {
    console.info('[SMS placeholder] To ' + phone + ': Your FarmDirect application is approved.');
    return true;
  },

  async sendSmsCrateAccountNotification(phone: string, fullName: string, accountCreationLink: string) {
    console.info('[SMS placeholder] To ' + phone + ': Create your account: ' + accountCreationLink);
    return true;
  },

  async testConnection() {
    return !!BREVO_API_KEY;
  },
};
