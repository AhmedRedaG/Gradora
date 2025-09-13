import { IsNumberString, Length } from 'class-validator';
import { LocalLoginDto } from './login.dto';

export class ResetPasswordDto extends LocalLoginDto {
  @IsNumberString()
  @Length(3, 10)
  otp: number;
}
