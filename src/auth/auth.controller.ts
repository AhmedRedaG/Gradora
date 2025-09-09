import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { AuthService } from './auth.service';
import { LocalLoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  sendVerificationToken() {}

  @Patch('verify/:verificationToken')
  verify() {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LocalLoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh() {}

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout() {}
}
