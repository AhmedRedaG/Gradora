import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/typeorm/entities/user/user.entity';
import { LocalLoginDto } from 'src/auth/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtTypes } from './types/jwt.types';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/auth/refresh-token.entity';
import { Repository } from 'typeorm';
import { AuthAttempt } from 'src/typeorm/entities/auth/auth-attempt.entity';
import { Otp } from 'src/typeorm/entities/auth/otp.entity';
import { randomInt } from 'crypto';
import {
  AuthAttemptConfig,
  JwtConfig,
  OtpConfig,
  VerificationConfig,
} from 'src/config/config.types';
import { AuthAttemptTypes } from './types/auth.types';

@Injectable()
export class AuthUtilsService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(AuthAttempt)
    private authAttemptRepository: Repository<AuthAttempt>,
    @InjectRepository(Otp) private otpRepository: Repository<Otp>,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LocalLoginDto): Promise<User> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('invalid email or password');
    }

    const authAttempt = await this.validateAuthAttemptsLimit(
      user.id,
      AuthAttemptTypes.LOGIN,
    );

    const isValidPassword = await this.validatePassword(
      loginDto.password,
      user.password!,
    );
    if (!isValidPassword) {
      await this.authAttemptRepository.increment(
        { id: authAttempt.id },
        'login',
        1,
      );

      throw new UnauthorizedException('invalid email or password');
    }

    await this.authAttemptRepository.update(authAttempt.id, {
      login: 0,
      reset: 0,
    });

    delete user.password;

    return user;
  }

  async validateSendOtpAttempts(userId: string): Promise<number> {
    const otpAttempt = await this.otpRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    if (!otpAttempt.length) {
      return 0;
    }
    const lastOtpAttempt = otpAttempt[0];

    const attemptsCount = lastOtpAttempt.attempts;
    const lastAttemptAt = lastOtpAttempt.createdAt;
    const config = this.configService.get<OtpConfig>('otp')!;

    this.validateSendAttemptsLimit(attemptsCount, lastAttemptAt, config);

    return lastOtpAttempt.attempts;
  }

  async validateSendVerificationAttempts(userId: string) {
    const authAttempt = await this.authAttemptRepository.findOneBy({
      user: { id: userId },
    });

    if (!authAttempt) {
      throw new Error('no authAttempt fund for user: ' + userId);
    }

    const attemptsCount = authAttempt.verificationAttempts;
    const lastAttemptAt = authAttempt.lastVerificationAttempt;
    const config = this.configService.get<VerificationConfig>('verification')!;

    this.validateSendAttemptsLimit(attemptsCount, lastAttemptAt, config);

    authAttempt.verificationAttempts++;
    authAttempt.lastVerificationAttempt = new Date();

    return await this.authAttemptRepository.save(authAttempt);
  }

  validateSendAttemptsLimit(
    attemptsCount: number,
    lastAttemptAt: Date,
    config: VerificationConfig,
  ): void {
    const { maxAttempts, coolDown, maxCoolDown } = config;
    const now = new Date();

    if (attemptsCount >= maxAttempts) {
      throw new ForbiddenException(
        'too many attempts. please contact support.',
      );
    }

    const backBase = coolDown + 1000 * 60 * 5; // 5m for safe
    const lockUntil = new Date(
      lastAttemptAt.getTime() +
        Math.min(coolDown * 2 ** attemptsCount - backBase, maxCoolDown),
    );

    if (lockUntil > now) {
      throw new ForbiddenException(
        `too many attempts. try again after ${lockUntil.toLocaleString()} or contact support.`,
      );
    }
  }

  async validateAuthAttemptsLimit(
    userId: string,
    authType: AuthAttemptTypes,
  ): Promise<AuthAttempt> {
    const authAttempt = await this.authAttemptRepository.findOneBy({
      user: { id: userId },
    });

    if (!authAttempt) {
      throw new Error('no authAttempt fund for user: ' + userId);
    }

    const { maxAttempts, maxErrorMessage } =
      this.configService.get<AuthAttemptConfig>(`auth.${authType}`)!;

    if (authAttempt[authType] >= maxAttempts) {
      throw new ForbiddenException(
        `too many attempts. ${maxErrorMessage} or contact support.`,
      );
    }

    return authAttempt;
  }

  async generateOtp(userId: string, attemptsCount: number): Promise<number> {
    const { min, max, expiresInMS } = this.configService.get<OtpConfig>('otp')!;

    const code = randomInt(min, +max);
    const attempts = ++attemptsCount;
    const expiresAt = new Date(Date.now() + expiresInMS);

    await this.otpRepository.save({
      user: { id: userId },
      code,
      attempts,
      expiresAt,
    });

    return code;
  }

  async generateAuthTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, JwtTypes.ACC),
      this.generateToken(payload, JwtTypes.REF),
    ]);

    return { accessToken, refreshToken };
  }

  async generateToken(payload: JwtPayload, tokenType: JwtTypes) {
    const { secret, expiresIn } = this.configService.get<JwtConfig>(
      `jwt.${tokenType}`,
    )!;

    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return token;
  }

  async verifyToken(token: string, tokenType: JwtTypes): Promise<JwtPayload> {
    const secret = this.configService.get(`jwt.${tokenType}.secret`) as string;
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('invalid or expired token');
    }

    return payload;
  }

  async setRefreshToken(user: User, token: string): Promise<RefreshToken> {
    const refreshToken = new RefreshToken();
    refreshToken.token = token;
    refreshToken.expiresAt = new Date(
      Date.now() + +this.configService.get('jwt.refresh.expiresInMS'),
    );
    refreshToken.user = user;

    return await this.refreshTokenRepository.save(refreshToken);
  }

  async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get<string>('bcrypt.rounds')!;
    return await bcrypt.hash(password, rounds);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
