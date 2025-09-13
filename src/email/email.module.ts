import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { VerifyAccountMail } from './content/verify.content';
import { ResetPasswordMail } from './content/reset.content';

@Module({
  providers: [EmailService, VerifyAccountMail, ResetPasswordMail],
  exports: [EmailService],
})
export class EmailModule {}
