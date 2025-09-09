import { IsEmail, IsStrongPassword } from 'class-validator';

export class LocalLoginDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
