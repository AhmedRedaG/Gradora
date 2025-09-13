import { IsNumberString } from 'class-validator';
import { LocalLoginDto } from './login.dto';

export class ResetPasswordDto extends LocalLoginDto {
  @IsNumberString()
  otp: number;
}
