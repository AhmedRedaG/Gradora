import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMailOptions } from 'nodemailer';
import { User } from 'src/typeorm/entities/user/user.entity';

@Injectable()
export class VerifyAccountMail {
  constructor(private configService: ConfigService) {}

  createMail(user: User, verificationToken: string): SendMailOptions {
    const serverEmail = this.configService.get<string>('email.serverEmail');
    const clientUrl = this.configService.get<string>('client.baseUrl');
    const companyName = this.configService.get<string>('company.name');
    const verifyUrl = `${clientUrl}/verify-account/${verificationToken}`;
    const firstName = user.firstName || 'there';

    // console.log(supportEmail, serverEmail, clientUrl);

    const mailOptions: SendMailOptions = {
      from: `"${companyName}" <${serverEmail}>`,
      to: user.email,
      subject: `Verify Your ${companyName} Account`,
      text: this.generatePlainTextContent(firstName, verifyUrl),
      html: this.generateHtmlContent(firstName, verifyUrl),
    };

    return mailOptions;
  }

  private generatePlainTextContent(firstName: string, verifyUrl: string) {
    const supportEmail = this.configService.get<string>('email.supportEmail');
    const companyName = this.configService.get<string>('company.name');

    return `
Hi ${firstName},

Welcome to ${companyName}! We're excited to have you on board.

To complete your account setup, please verify your email address by clicking the link below:
${verifyUrl}

This verification link will expire in 15 minutes for your security.

If you did not create this account, please ignore this email.

Thanks,
The ${companyName} Team

Need help? Contact us at ${supportEmail}`;
  }

  private generateHtmlContent(firstName: string, verifyUrl: string) {
    const supportEmail = this.configService.get<string>('email.supportEmail');
    const companyName = this.configService.get<string>('company.name');

    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="text-align: center; color: #333;">✅ Verify Your Account</h2>
  
  <p style="font-size: 16px; color: #555;">
    Hi <strong>${firstName}</strong>,
  </p>
  
  <p style="font-size: 16px; color: #555;">
    Welcome to ${companyName}! We're excited to have you on board. To complete your account setup, please verify your email address.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verifyUrl}" 
      style="background-color: #2196F3; color: white; padding: 14px 24px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
      Verify Account
    </a>
  </div>

  <p style="font-size: 14px; color: #888; text-align: center;">
    This verification link will expire in 15 minutes for your security.
  </p>
  
  <p style="font-size: 12px; color: #555; text-align: center;">
    Or copy and paste this link into your browser:<br>
    <a href="${verifyUrl}" style="color:#2196F3; word-break: break-all;">${verifyUrl}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    © ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
    Need help? Contact us at <a href="mailto:${supportEmail}" style="color: #888;">${supportEmail}</a>
  </p>
</div>`;
  }
}
