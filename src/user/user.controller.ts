import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
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
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';
import { ResetPasswordDto } from './dto/requests/reset-password';
import { I18nService } from 'nestjs-i18n';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
  ) {}
  @Post('/signup')
  @IsPublicRoute()
  async signup(@Body() dto: SignupDto) {
    return await this.userService.signup(dto);
  }
  @Post('/login')
  @IsPublicRoute()
  async login(@Body() dto: LoginDto) {
    return await this.userService.login(dto);
  }
  @Post('/logout')
  async logout(@Req() req: Request) {
    const token = extractTokenFromHeader(req);
    if (!token)
      throw new UnauthorizedException(
        this.i18nService.translate('common.request.errors.token_invalid'),
      );
    return await this.userService.logout(token);
  }
  @Get('/resend-verify-email')
  @IsPublicRoute()
  async resendVerifyEmail(@Query('email') email: string) {
    if (!email)
      throw new NotFoundException(
        this.i18nService.translate('common.request.errors.email_not_found'),
      );
    return await this.userService.resendVerifyEmail(email);
  }
  @Get('/verify-email')
  @IsPublicRoute()
  async verifyEmail(@Query('token') token: string) {
    if (!token)
      throw new BadRequestException(
        this.i18nService.translate('common.request.errors.token_not_found'),
      );
    return await this.userService.verifyEmail(token);
  }
  @Get('/forgot-password')
  async forgotPassowrd(@Query('email') email: string) {
    if (!email)
      throw new NotFoundException(
        this.i18nService.translate('common.request.errors.email_not_found'),
      );
    return await this.userService.forgotPassword(email);
  }
  @Post('/reset-password')
  @IsPublicRoute()
  async resetPassowrd(@Body() dto: ResetPasswordDto) {
    return await this.userService.resetPassword(dto);
  }
}
