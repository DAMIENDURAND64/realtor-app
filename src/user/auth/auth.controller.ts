import { Body, Controller, Param, ParseEnumPipe, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, SigninDto, GenerateProductKeyDto } from '../dtos/dto';
import { UserType } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/signup/:userType')
  signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    return this.authService.signup(body, userType);
  }

  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('/key')
  generateProductKey(@Body() { userType, email }: GenerateProductKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }
}
