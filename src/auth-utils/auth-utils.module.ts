import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/auth/refresh-token.entity';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { CookieModule } from 'src/cookie/cookie.module';
import { AuthAttempt } from 'src/typeorm/entities/auth/auth-attempt.entity';
import { Otp } from 'src/typeorm/entities/auth/otp.entity';
import { AuthUtilsService } from './auth-utils.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, AuthAttempt, Otp]),
    JwtModule.register({}),
    forwardRef(() => UserModule),
    CookieModule,
  ],
  providers: [AuthUtilsService],
  exports: [AuthUtilsService],
})
export class AuthUtilsModule {}
