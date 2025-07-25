import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './dto/requests/signup.dto';
import { LoginDto } from './dto/requests/login.dto';
import { extractTokenFromHeader } from 'src/common/utils/jwt.util';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/signup')
  async signup(@Body() dto: SignupDto) {
    return await this.userService.signup(dto);
  }
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return await this.userService.login(dto);
  }
  @Post('/logout')
  async logout(@Req() req: Request) {
    const token = extractTokenFromHeader(req);
    if (!token) throw new UnauthorizedException('Token is invalid');
    return await this.userService.logout(token);
  }
  @Get('/resend-verify-email')
  async resendVerifyEmail(@Query('email') email: string) {
    return await this.userService.resendVerifyEmail(email);
  }
  @Get('/verify-email')
  async verifyEmail(@Query('token') token: string) {
    return await this.userService.verifyEmail(token);
  }
}
