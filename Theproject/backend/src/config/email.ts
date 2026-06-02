import * as Brevo from '@getbrevo/brevo';

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

const FROM_EMAIL = 'bukopandan3216@gmail.com';
const FROM_NAME = 'FarmDirect';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://farmers-website-new.vercel.app').replace(/\/$/, '');
const TTL_DAYS = parseInt(process.env.REGISTRATION_TOKEN_TTL_DAYS || '30', 10);

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
    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'Create Your FarmDirect Account — Application Approved!';
      sendSmtpEmail.sender = { name: FROM_NAME, email: FROM_EMAIL };
      sendSmtpEmail.to = [{ email, name: fullName }];
      sendSmtpEmail.htmlContent = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#059669,#047857);color:white;padding:20px;border-radius:8px 8px 0 0">
            <h1>Your Application is Approved! 🎉</h1>
          </div>
          <div style="background:#f9fafb;padding:20px">
            <p>Dear <strong style="color:#059669">${fullName}</strong>,</p>
            <p>Your <strong>${role === 'FARMER' ? 'Farmer/Seller' : 'Buyer'}</strong> application has been <strong style="color:#059669">APPROVED</strong>!</p>
            <p>Click below to set your password and activate your account:</p>
            <div style="text-align:center;margin:20px 0">
              <a href="${accountCreationLink}" style="background:#059669;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">
                Create Your Account →
              </a>
            </div>
            <div style="background:#ecfdf5;border-left:4px solid #059669;padding:15px;margin:20px 0;word-break:break-all">
              <strong>Button not working?</strong> Copy this link:<br>
              <span style="color:#059669">${accountCreationLink}</span>
            </div>
            <p><strong>⚠️ This link expires in ${TTL_DAYS} days.</strong></p>
            <p>Best regards,<br><strong>The FarmDirect Team</strong></p>
          </div>
          <div style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#6b7280">
            <p>&copy; ${new Date().getFullYear()} FarmDirect. All rights reserved.</p>
          </div>
        </div>`;

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Approval email sent to:', email);
      return true;
    } catch (error) {
      console.error('Error sending approval email:', error);
      return false;
    }
  },

  async sendApprovalEmail(email: string, fullName: string, role: string) {
    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'Your FarmDirect Account Has Been Approved!';
      sendSmtpEmail.sender = { name: FROM_NAME, email: FROM_EMAIL };
      sendSmtpEmail.to = [{ email, name: fullName }];
      sendSmtpEmail.htmlContent = `<p>Dear ${fullName}, your ${role} account has been approved! <a href="${FRONTEND_URL}/login">Login here</a>.</p>`;

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Approval email sent to:', email);
      return true;
    } catch (error) {
      console.error('Error sending approval email:', error);
      return false;
    }
  },

  async sendRejectionEmail(email: string, fullName: string, rejectionReason: string) {
    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'FarmDirect Application Status Update';
      sendSmtpEmail.sender = { name: FROM_NAME, email: FROM_EMAIL };
      sendSmtpEmail.to = [{ email, name: fullName }];
      sendSmtpEmail.htmlContent = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);color:white;padding:20px;border-radius:8px 8px 0 0">
            <h1>Application Status Update</h1>
          </div>
          <div style="background:#f9fafb;padding:20px">
            <p>Dear <strong>${fullName}</strong>,</p>
            <p>Unfortunately your application has been <strong style="color:#dc2626">REJECTED</strong>.</p>
            <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:15px;margin:20px 0">
              <strong>Reason:</strong><p>${rejectionReason}</p>
            </div>
            <p>Questions? Contact us at <strong>support@farmdirect.com</strong>.</p>
            <p>Best regards,<br><strong>The FarmDirect Team</strong></p>
          </div>
          <div style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#6b7280">
            <p>&copy; ${new Date().getFullYear()} FarmDirect. All rights reserved.</p>
          </div>
        </div>`;

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Rejection email sent to:', email);
      return true;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return false;
    }
  },

  async sendSmsNotification(phone: string, fullName: string, role: string) {
    console.info(`[SMS placeholder] To ${phone}: Your FarmDirect application is approved.`);
    return true;
  },

  async sendSmsCrateAccountNotification(phone: string, fullName: string, accountCreationLink: string) {
    console.info(`[SMS placeholder] To ${phone}: Create your account: ${accountCreationLink}`);
    return true;
  },

  async testConnection() {
    return !!process.env.BREVO_API_KEY;
  },
};