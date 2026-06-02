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
      sendSmtpEmail.htmlContent = '<p>Your application is approved! <a href="' + accountCreationLink + '">Create your account</a>. Link expires in ' + TTL_DAYS + ' days.</p>';
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent to:', email);
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
      sendSmtpEmail.htmlContent = '<p>Dear ' + fullName + ', your account has been approved! <a href="' + FRONTEND_URL + '/login">Login here</a>.</p>';
      await apiInstance.sendTransacEmail(sendSmtpEmail);
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
      sendSmtpEmail.htmlContent = '<p>Dear ' + fullName + ', your application has been rejected. Reason: ' + rejectionReason + '</p>';
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      return true;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return false;
    }
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
    return !!process.env.BREVO_API_KEY;
  },
};
