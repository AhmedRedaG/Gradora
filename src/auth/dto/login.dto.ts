import { IsEmail, IsStrongPassword, Length } from 'class-validator';

export class LocalLoginDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @Length(8, 256)
  password: string;
}
