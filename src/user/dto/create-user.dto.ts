import {
  IsAlpha,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsAlpha()
  @Length(1, 128)
  firstName: string;

  @IsAlpha()
  @Length(1, 128)
  lastName: string;

  @IsOptional()
  @IsAlpha()
  @Length(1, 2048)
  bio?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  @Length(8, 256)
  password: string;

  @IsOptional()
  @IsUrl()
  @Length(1, 256)
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  @Length(1, 256)
  githubUrl?: string;

  @IsOptional()
  @IsUrl()
  @Length(1, 256)
  portfolioUrl?: string;
}
