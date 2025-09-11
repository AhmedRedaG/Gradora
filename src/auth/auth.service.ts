import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/typeorm/entities/user/user.entity';
import { LocalLoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtTypes } from './types/jwt.types';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/auth/refreshToken.entity';
import { Repository } from 'typeorm';
import { AuthAttempt } from 'src/typeorm/entities/auth/authAttempt.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(AuthAttempt)
    private authAttemptRepository: Repository<AuthAttempt>,
    private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto) {
    userDto.password = await bcrypt.hash(
      userDto.password,
      this.configService.get('bcrypt.rounds')!,
    );

    const user = await this.userService.create(userDto);

    const authAttempt = new AuthAttempt();
    authAttempt.user = user;
    await this.authAttemptRepository.save(authAttempt);

    return { user };
  }

  async sendVerificationToken(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('user already verified');
    }

    await this.validateVerificationAttempts(user.id);

    const verificationToken = await this.generateToken(
      { sub: user.id },
      JwtTypes.VER,
    );

    // send verification mail
    // ...
  }

  async login(loginDto: LocalLoginDto) {
    const user = await this.validateUser(loginDto);

    if (!user.isVerified) {
      throw new ForbiddenException('user not verified yet');
    }

    const { accessToken, refreshToken } = await this.generateAuthTokens({
      sub: user.id,
    });

    await this.setRefreshToken(user, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string | undefined) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('missing refresh token cookie');
    }

    const { sub: userId } = await this.verifyToken(
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

    const { accessToken, refreshToken } = await this.generateAuthTokens({
      sub: userId,
    });

    await this.setRefreshToken(result.user, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(oldRefreshToken: string | undefined, full: boolean) {
    if (!oldRefreshToken) {
      throw new BadRequestException('already logged out');
    }

    const { sub: userId } = await this.verifyToken(
      oldRefreshToken,
      JwtTypes.REF,
    );

    const where = full ? { user: { id: userId } } : { token: oldRefreshToken };

    await this.refreshTokenRepository.delete(where);

    return;
  }

  async validateVerificationAttempts(userId: string) {
    const authAttempt = await this.authAttemptRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!authAttempt) {
      throw new NotFoundException('Attempts not found');
    }

    const { maxAttempts, coolDown, maxCoolDown } =
      this.configService.get('verification');
    const now = new Date();

    if (authAttempt.verificationAttempts >= maxAttempts) {
      const lockUntil = new Date(
        authAttempt.lastVerificationAttempt.getTime() +
          Math.min(
            coolDown * 2 ** (authAttempt.verificationAttempts - maxAttempts),
            +maxCoolDown,
          ),
      );

      if (lockUntil > now) {
        throw new ForbiddenException(
          `Too many attempts. Try again after ${lockUntil.toLocaleString()} or contact support.`,
        );
      }
    }

    authAttempt.verificationAttempts++;
    authAttempt.lastVerificationAttempt = now;

    return await this.authAttemptRepository.save(authAttempt);
  }

  async generateAuthTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, JwtTypes.ACC),
      this.generateToken(payload, JwtTypes.REF),
    ]);

    return { accessToken, refreshToken };
  }

  async generateToken(payload: JwtPayload, tokenType: JwtTypes) {
    const secret = this.configService.get(`jwt.${tokenType}.secret`) as string;
    const expiresIn = this.configService.get(
      `jwt.${tokenType}.expiresIn`,
    ) as number;

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

  async validateUser(loginDto: LocalLoginDto): Promise<User> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password!,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('invalid email or password');
    }

    const { password, ...result } = user;

    return result;
  }
}
