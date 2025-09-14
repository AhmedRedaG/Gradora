import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { LocalLoginDto } from './dto/login.dto';
import { JwtTypes } from '../auth-utils/types/jwt.types';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/auth/refresh-token.entity';
import { MoreThan, Repository } from 'typeorm';
import { AuthAttempt } from 'src/typeorm/entities/auth/auth-attempt.entity';
import { EmailService } from 'src/email/email.service';
import { Otp } from 'src/typeorm/entities/auth/otp.entity';
import { AuthAttemptTypes } from '../auth-utils/types/auth.types';
import { AuthUtilsService } from 'src/auth-utils/auth-utils.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(AuthAttempt)
    private authAttemptRepository: Repository<AuthAttempt>,
    @InjectRepository(Otp) private otpRepository: Repository<Otp>,
    private userService: UserService,
    private emailService: EmailService,
    private authUtilsService: AuthUtilsService,
  ) {}

  async register(userDto: CreateUserDto) {
    userDto.password = await this.authUtilsService.hashPassword(
      userDto.password,
    );

    const user = await this.userService.create(userDto);

    const authAttempt = new AuthAttempt();
    authAttempt.user = user;
    await this.authAttemptRepository.save(authAttempt);

    return { user };
  }

  async sendVerification(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('user already verified');
    }

    await this.authUtilsService.validateSendVerificationAttempts(user.id);

    const verificationToken = await this.authUtilsService.generateToken(
      { sub: user.id },
      JwtTypes.VER,
    );

    // to avoid I/O blocking
    this.emailService
      .sendVerifyTokenMail(user, verificationToken)
      .catch((error: Error) => {
        console.error(
          `Failed to send verification email for user ${user.id}:`,
          error.message,
        );
        throw error;
      });

    return { message: 'a verification link is being sent to your email.' };
  }

  async verify(verificationToken: string) {
    const { sub: userId } = await this.authUtilsService.verifyToken(
      verificationToken,
      JwtTypes.VER,
    );

    const user = await this.userService.findById(userId);
    if (user.isVerified) {
      throw new BadRequestException('user already verified');
    }
    user.isVerified = true;
    await this.userService.confirmVerification(userId);

    const { accessToken, refreshToken } =
      await this.authUtilsService.generateAuthTokens({
        sub: userId,
      });

    await this.authUtilsService.setRefreshToken(user, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async login(loginDto: LocalLoginDto) {
    const { user, isValid } =
      await this.authUtilsService.validateUser(loginDto);

    if (user) {
      await this.authUtilsService.validateAuthAttempts(
        user.id,
        AuthAttemptTypes.LOGIN,
        isValid,
      );
    }

    if (!user || !isValid) {
      throw new UnauthorizedException('invalid email or password');
    }
    if (!user.isVerified) {
      throw new ForbiddenException('user not verified yet');
    }

    const { accessToken, refreshToken } =
      await this.authUtilsService.generateAuthTokens({
        sub: user.id,
      });
    await this.authUtilsService.setRefreshToken(user, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string | undefined) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('missing refresh token cookie');
    }

    const { sub: userId } = await this.authUtilsService.verifyToken(
      oldRefreshToken,
      JwtTypes.REF,
    );

    const result = await this.refreshTokenRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        token: oldRefreshToken,
        user: { id: userId },
      },
    });
    if (!result) {
      throw new UnauthorizedException(
        'invalid or expired refresh token cookie',
      );
    }

    await this.refreshTokenRepository.delete(result.id);

    const { accessToken, refreshToken } =
      await this.authUtilsService.generateAuthTokens({
        sub: userId,
      });
    await this.authUtilsService.setRefreshToken(result.user, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(oldRefreshToken: string | undefined, full: boolean) {
    if (!oldRefreshToken) {
      throw new BadRequestException('already logged out');
    }

    const { sub: userId } = await this.authUtilsService.verifyToken(
      oldRefreshToken,
      JwtTypes.REF,
    );

    const where = full ? { user: { id: userId } } : { token: oldRefreshToken };
    await this.refreshTokenRepository.delete(where);

    return;
  }

  async sendResetPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    // for more security
    if (user) {
      const attemptsCount = await this.authUtilsService.validateSendOtpAttempts(
        user.id,
      );

      const otp = await this.authUtilsService.generateOtp(
        user.id,
        attemptsCount,
      );

      this.emailService.sendResetOtpMail(user, otp).catch((error: Error) => {
        console.error(
          `failed to send reset password email for user ${user.id}:`,
          error.message,
        );
        throw error;
      });
    }

    return {
      message:
        'if an account exists for this email, a password reset code has been sent.',
    };
  }

  async reset(email: string, otpCode: number, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const otpRecord = await this.otpRepository.findOneBy({
      code: otpCode,
      user: { id: user.id },
      expiresAt: MoreThan(new Date()),
    });

    await this.authUtilsService.validateAuthAttempts(
      user.id,
      AuthAttemptTypes.RESET,
      otpRecord ? true : false,
    );

    if (!otpRecord) {
      throw new UnauthorizedException('invalid or expired otp');
    }

    await Promise.all([
      this.userService.setPassword(user.id, password),

      this.refreshTokenRepository.delete({ user }),

      this.otpRepository.delete({ user }),
    ]);

    return { message: 'password has been reset' };
  }
}
