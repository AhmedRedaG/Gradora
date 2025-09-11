import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/auth/refreshToken.entity';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { CookieModule } from 'src/cookie/cookie.module';
import { AuthAttempt } from 'src/typeorm/entities/auth/authAttempt.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, AuthAttempt]),
    JwtModule.register({}),
    UserModule,
    CookieModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
