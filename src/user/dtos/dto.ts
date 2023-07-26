import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^\(?([\d]{3})\)?[-. ]?([\d]{3})[-. ]?([\d]{4})$/, {
    message: 'Phone number must be in the format (xxx) xxx-xxxx',
  })
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey?: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class GenerateProductKeyDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsEnum(UserType)
  userType: UserType;
}
