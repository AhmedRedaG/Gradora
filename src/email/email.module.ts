import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { VerifyAccountMail } from './content/verify.content';

@Module({
  providers: [EmailService, VerifyAccountMail],
  exports: [EmailService],
})
export class EmailModule {}
