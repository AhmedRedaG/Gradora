import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMailOptions } from 'nodemailer';
import { User } from 'src/typeorm/entities/user/user.entity';

@Injectable()
export class ResetPasswordMail {
  constructor(private configService: ConfigService) {}

  createMail(user: User, otp: number): SendMailOptions {
    const serverEmail = this.configService.get<string>('email.serverEmail');
    const companyName = this.configService.get<string>('company.name');
    const firstName = user.firstName || 'there';
    const expiresInMS = this.configService.get<number>('otp.expiresInMS')!;
    const expiresInMinutes = Math.ceil(expiresInMS / 60000);

    const mailOptions: SendMailOptions = {
      from: `"${companyName}" <${serverEmail}>`,
      to: user.email,
      subject: `Your ${companyName} password reset code`,
      text: this.generatePlainTextContent(firstName, otp, expiresInMinutes),
      html: this.generateHtmlContent(firstName, otp, expiresInMinutes),
    };

    return mailOptions;
  }

  private generatePlainTextContent(
    firstName: string,
    otp: number,
    expiresInMinutes: number,
  ) {
    const supportEmail = this.configService.get<string>('email.supportEmail');
    const companyName = this.configService.get<string>('company.name');

    return `
Hi ${firstName},

We received a request to reset your password for your ${companyName} account.

Use this one-time code to reset your password:
${otp}

This code will expire in ${expiresInMinutes} minutes. If you did not request this, please ignore this email.

Thanks,  
The ${companyName} Team  

Need help? Contact us at ${supportEmail}`;
  }

  private generateHtmlContent(
    firstName: string,
    otp: number,
    expiresInMinutes: number,
  ) {
    const supportEmail = this.configService.get<string>('email.supportEmail');
    const companyName = this.configService.get<string>('company.name');
    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="text-align: center; color: #333;">🔒 Reset Your Password</h2>
  
  <p style="font-size: 16px; color: #555;">
    Hi <strong>${firstName}</strong>,
  </p>
  
  <p style="font-size: 16px; color: #555;">
    Use the following one-time code to reset your password:
  </p>

  <div style="text-align: center; margin: 24px 0;">
    <div style="display: inline-block; letter-spacing: 4px; font-size: 28px; font-weight: 700; padding: 12px 20px; border-radius: 8px; background-color: #111827; color: #ffffff;">
      ${otp}
    </div>
  </div>

  <p style="font-size: 14px; color: #555; text-align: center;">
    This code expires in <strong>${expiresInMinutes} minutes</strong>.
  </p>

  <p style="font-size: 12px; color: #888; text-align: center;">
    If you didn't request a password reset, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    © ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
    Need help? Contact us at <a href="mailto:${supportEmail}" style="color: #888;">${supportEmail}</a>
  </p>
</div>`;
  }
}
