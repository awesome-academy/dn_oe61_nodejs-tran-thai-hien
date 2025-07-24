import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { ProfileUpdateRequestDto } from './dto/requests/profile-update.dto';
import { StatusUpdateRequestDto } from './dto/requests/status-update.dto';
import { HasRole } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { VerifyUpdateRequestDto } from './dto/requests/verify-update.dto';
import { RoleUpdateRequestDto } from './dto/requests/role-update.dto';
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
  @IsPublicRoute()
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
  @Get('/profile')
  async myProfile(@CurrentUser() user: AccessTokenPayload) {
    return await this.userService.myProfile(user);
  }
  @Patch('/profile')
  async updateProfile(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ProfileUpdateRequestDto,
  ) {
    return await this.userService.updateMyProfile(user, dto);
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch('/:id/status')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusUpdateRequestDto,
  ) {
    return await this.userService.changeStatus(id, dto);
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch('/:id/verify')
  async changeVerify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyUpdateRequestDto,
  ) {
    return await this.userService.changeVerify(id, dto);
  }
  @HasRole(Role.ADMIN)
  @Patch('/:id/role')
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RoleUpdateRequestDto,
  ) {
    return await this.userService.changeRole(id, dto);
  }
}
