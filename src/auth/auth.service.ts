import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/typeorm/entities/user/user.entity';
import { LocalLoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwtPayload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/auth/refreshToken.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto) {
    userDto.password = await bcrypt.hash(
      userDto.password,
      this.configService.get('bcrypt.rounds')!,
    );

    // send confirmation mail
    // ...

    const user = await this.userService.create(userDto);

    return { user };
  }

  async login(loginDto: LocalLoginDto) {
    const user = await this.validateUser(loginDto);

    // check if confirmed
    // ...

    const { accessToken, refreshToken } = await this.generateTokens({
      sub: user.id,
    });

    await this.setRefreshToken(user, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string | undefined) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('missing refresh token cookie');
    }

    const { sub: userId } = await this.verifyRefreshToken(oldRefreshToken);

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

    const { accessToken, refreshToken } = await this.generateTokens({
      sub: userId,
    });

    await this.setRefreshToken(result.user, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(oldRefreshToken: string | undefined, full: boolean) {
    if (!oldRefreshToken) {
      throw new BadRequestException('already logged out');
    }

    const { sub: userId } = await this.verifyRefreshToken(oldRefreshToken);

    const where = full ? { user: { id: userId } } : { token: oldRefreshToken };

    await this.refreshTokenRepository.delete(where);

    return;
  }

  async generateTokens(payload: JwtPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.access.secret'),
      expiresIn: this.configService.get('jwt.access.expiresIn'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.refresh.secret'),
      expiresIn: this.configService.get('jwt.refresh.expiresIn'),
    });

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('jwt.refresh.secret'),
      });
    } catch {
      throw new UnauthorizedException('invalid refresh token');
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
