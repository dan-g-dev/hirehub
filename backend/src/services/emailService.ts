import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: string;
  customMessage?: string;
  actionUrl?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (host && user && pass && host !== 'smtp.ethionet.et') {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user, pass },
        });
        this.isConfigured = true;
        console.log('[EmailService] SMTP transporter configured successfully.');
      } catch (err) {
        console.warn('[EmailService] Failed to configure SMTP, running in dev log mode:', err);
        this.isConfigured = false;
      }
    } else {
      console.log('[EmailService] Running in Development Logging Mode (No external SMTP configured).');
      this.isConfigured = false;
    }
  }

  public async sendStatusUpdateEmail(payload: EmailPayload): Promise<{ sent: boolean; mode: 'smtp' | 'dev_log' }> {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: #0f172a; color: #ffffff; padding: 28px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .header p { margin: 6px 0 0; font-size: 14px; color: #94a3b8; }
          .content { padding: 32px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; background: #e0f2fe; color: #0369a1; }
          .card { background: #f1f5f9; border-radius: 8px; padding: 18px; margin: 20px 0; border-left: 4px solid #059669; }
          .btn { display: inline-block; padding: 12px 24px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HireHub Ethiopia</h1>
            <p>ሀይርሀብ ኢትዮጵያ — National Employment Portal</p>
          </div>
          <div class="content">
            <h2>Application Update</h2>
            <p>Dear <strong>${payload.applicantName}</strong>,</p>
            <p>There is a new update regarding your application for <strong>${payload.jobTitle}</strong> at <strong>${payload.companyName}</strong>.</p>
            
            <div class="card">
              <p style="margin:0 0 8px;"><strong>Current Status:</strong> <span class="badge">${payload.status}</span></p>
              ${payload.customMessage ? `<p style="margin:0;"><strong>Note from Employer:</strong> ${payload.customMessage}</p>` : ''}
            </div>

            <p>Please login to your HireHub candidate dashboard to view the full timeline and next steps.</p>
            
            <a href="${payload.actionUrl || 'https://hirehub.et/student/applications'}" class="btn">View Application on HireHub</a>
          </div>
          <div class="footer">
            <p>© 2026 HireHub Ethiopia PLC. Addis Ababa, Ethiopia.</p>
            <p>Empowering Ethiopian Students and High-Growth Companies.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: process.env.SMTP_FROM || '"HireHub Ethiopia" <notifications@hirehub.et>',
          to: payload.to,
          subject: payload.subject,
          html: htmlTemplate,
        });
        console.log(`[EmailService] Email successfully sent to ${payload.to} (${payload.subject})`);
        return { sent: true, mode: 'smtp' };
      } catch (err) {
        console.error('[EmailService] SMTP send error:', err);
        return { sent: false, mode: 'smtp' };
      }
    } else {
      console.log(`[EmailService: DEV LOG] Email to: ${payload.to} | Subject: ${payload.subject} | Status: ${payload.status}`);
      return { sent: true, mode: 'dev_log' };
    }
  }
}

export const emailService = new EmailService();
