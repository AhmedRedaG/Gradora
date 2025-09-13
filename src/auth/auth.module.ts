import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/auth/refresh-token.entity';
import { UserModule } from 'src/user/user.module';
import { CookieModule } from 'src/cookie/cookie.module';
import { AuthAttempt } from 'src/typeorm/entities/auth/auth-attempt.entity';
import { EmailModule } from 'src/email/email.module';
import { Otp } from 'src/typeorm/entities/auth/otp.entity';
import { AuthUtilsModule } from 'src/auth-utils/auth-utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, AuthAttempt, Otp]),
    UserModule,
    CookieModule,
    EmailModule,
    AuthUtilsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
