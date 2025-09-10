import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { AuthService } from './auth.service';
import { LocalLoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { CookieService } from 'src/cookie/cookie.service';
import { Cookie } from './decorator/cookie.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
  ) {}

  @Post('register')
  async register(@Body() userDto: CreateUserDto) {
    const data = this.authService.register(userDto);
    return data;
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  sendVerificationToken() {}

  @Patch('verify/:verificationToken')
  verify() {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LocalLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...data } = await this.authService.login(loginDto);

    this.cookieService.createRefreshTokenCookie(refreshToken, res);

    return data;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Cookie('refreshToken') oldRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...data } =
      await this.authService.refresh(oldRefreshToken);

    this.cookieService.createRefreshTokenCookie(refreshToken, res);

    return data;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Cookie('refreshToken') oldRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
    @Query('full', new ParseBoolPipe({ optional: true })) full: boolean,
  ) {
    await this.authService.logout(oldRefreshToken, full);

    this.cookieService.clearRefreshTokenCookie(res);

    return;
  }
}
