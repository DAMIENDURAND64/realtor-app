import { ConflictException, Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

interface SignupParams {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  private async generateJWT(name: string, id: number) {
    return jwt.sign({ name, id }, process.env.JWT_SECRET, {
      expiresIn: 360000,
    });
  }

  generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return bcrypt.hash(string, 10);
  }

  async signup(
    { email, password, phone, name }: SignupParams,
    userType: UserType,
  ) {
    const userExists = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
        name,
        user_type: userType,
      },
    });
    console.log(user);

    return this.generateJWT(user.name, user.id);
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HttpException('No user found', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpException('Invalid credentials', 400);
    }

    return this.generateJWT(user.name, user.id);
  }
}
