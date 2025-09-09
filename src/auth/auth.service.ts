import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/typeorm/entities/user/user.entity';
import { LocalLoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
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

    const { password, ...user } = await this.userService.create(userDto);

    return { user };
  }

  async login(loginDto: LocalLoginDto) {
    // for more security
    let user: User;
    try {
      user = await this.userService.findByEmail(loginDto.email);
    } catch {
      throw new UnauthorizedException('invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('invalid email or password');
    }

    // check if confirmed
    // ...

    const { accessToken, refreshToken } = await this.generateTokens({
      sub: user.id,
    });

    return { user, accessToken, refreshToken };
  }

  async generateTokens(payload: any) {
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
}
