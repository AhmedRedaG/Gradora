import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import { VerifyAccountMail } from './content/verify.content';
import { User } from 'src/typeorm/entities/user/user.entity';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: Transporter;

  constructor(
    private configService: ConfigService,
    private verifyAccountMail: VerifyAccountMail,
  ) {}

  async onModuleInit() {
    this.transporter = await this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<Transporter> {
    const { smtpHost, smtpPort, smtpSecure, serverEmail, serverEmailPass } =
      this.configService.get('email');

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: serverEmail,
        pass: serverEmailPass,
      },
    });

    await transporter.verify();
    return transporter;
  }

  async sendMail(mailOptions: SendMailOptions) {
    if (!this.transporter) {
      throw new Error('Transporter not initialized');
    }
    return this.transporter.sendMail(mailOptions);
  }

  async sendVerifyTokenMail(user: User, verificationToken: string) {
    const mailOptions = this.verifyAccountMail.createMail(
      user,
      verificationToken,
    );

    return this.sendMail(mailOptions);
  }
}
