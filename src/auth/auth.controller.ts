import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { AuthService } from './auth.service';
import { LocalLoginDto } from './dto/login.dto';
import { type Response } from 'express';
import { CookieService } from 'src/cookie/cookie.service';
import { Cookie } from './decorator/cookie.decorator';
import { EmailDto } from './dto/email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
  async sendVerification(@Body() emailDto: EmailDto) {
    const data = await this.authService.sendVerification(emailDto.email);

    return data;
  }

  @Patch('verify/:verificationToken')
  async verify(
    @Param('verificationToken') verificationToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...data } =
      await this.authService.verify(verificationToken);

    this.cookieService.createRefreshTokenCookie(refreshToken, res);

    return data;
  }

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

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async sendResetPassword(@Body() emailDto: EmailDto) {
    const data = await this.authService.sendResetPassword(emailDto.email);

    return data;
  }

  @Patch('reset')
  async resetPassword(
    @Res({ passthrough: true }) res: Response,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const data = await this.authService.reset(
      resetPasswordDto.email,
      +resetPasswordDto.otp,
      resetPasswordDto.password,
    );

    this.cookieService.clearRefreshTokenCookie(res);

    return data;
  }
}
