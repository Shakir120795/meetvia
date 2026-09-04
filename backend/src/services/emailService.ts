import nodemailer from 'nodemailer';
import env from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    // Using console/fake transport for development
    // In production, configure with SMTP/SendGrid/etc
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });

  /**
   * Send OTP email
   */
  static async sendOtpEmail(email: string, otp: string, purpose: string): Promise<void> {
    const subject = this.getOtpSubject(purpose);
    const html = this.getOtpEmailTemplate(otp, purpose);
    const text = `Your Meetvia verification code is: ${otp}. This code expires in 10 minutes.`;

    await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  /**
   * Send email
   */
  private static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: env.FROM_EMAIL || 'noreply@meetvia.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });

      console.log(`Email sent to ${options.to}:`, info.messageId);
      
      // In development, log the email content
      if (env.NODE_ENV === 'development') {
        console.log('Email content:', options.html);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  private static getOtpSubject(purpose: string): string {
    switch (purpose) {
      case 'EMAIL_VERIFICATION':
        return 'Verify your Meetvia email address';
      case 'LOGIN':
        return 'Your Meetvia login code';
      case 'PASSWORD_RESET':
        return 'Reset your Meetvia password';
      default:
        return 'Your Meetvia verification code';
    }
  }

  private static getOtpEmailTemplate(otp: string, purpose: string): string {
    const action = purpose === 'LOGIN' ? 'sign in' : 'verify your account';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Meetvia Verification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .otp-box { background-color: #f8f9fa; border: 2px solid #007bff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Meetvia</h1>
                <p>Your Trusted Local Guide & Travel Companion</p>
            </div>
            
            <p>Hello,</p>
            <p>Use the verification code below to ${action}:</p>
            
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
                <li>This code expires in 10 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
            </ul>
            
            <div class="footer">
                <p>Need help? Contact us at support@meetvia.com</p>
                <p>&copy; ${new Date().getFullYear()} Meetvia. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}