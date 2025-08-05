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
  Render,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './dto/requests/signup.dto';
import { LoginDto } from './dto/requests/login.dto';
import { extractTokenFromHeader } from 'src/common/utils/jwt.util';
import { Request, Response } from 'express';
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
import { MessageResource } from 'src/common/decorators/resource.decorator';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { ConfigService } from '@nestjs/config';
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
    private readonly configService: ConfigService,
  ) {}
  @Post('/signup')
  @IsPublicRoute()
  @MessageResource('user', 'signup')
  async signup(@Body() dto: SignupDto) {
    return this.userService.signup(dto);
  }
  @Post('/login')
  @IsPublicRoute()
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.userService.login(dto);
    res.cookie('accessToken', result.data?.accessToken, {
      httpOnly: true,
      maxAge:
        this.configService.get<number>('cookie.accessTokenTTL', 3600) * 1000,
      sameSite: 'strict',
    });
    return res.send({
      success: true,
      data: {
        ...result.data,
        accessToken: undefined,
      },
    });
  }
  @IsPublicRoute()
  @Get('/login')
  @Render('pages/login')
  getLoginForm() {}
  @Post('/logout')
  async logout(@Req() req: Request) {
    const token = extractTokenFromHeader(req);
    if (!token)
      throw new UnauthorizedException(
        this.i18nService.translate('common.request.errors.token_invalid'),
      );
    return this.userService.logout(token);
  }
  @MessageResource('user', 'sendVerifyEmail')
  @Get('/resend-verify-email')
  @IsPublicRoute()
  async resendVerifyEmail(@Query('email') email: string) {
    if (!email)
      throw new NotFoundException(
        this.i18nService.translate('common.request.errors.email_not_found'),
      );
    return this.userService.resendVerifyEmail(email);
  }
  @Get('/verify-email')
  @IsPublicRoute()
  async verifyEmail(@Query('token') token: string) {
    if (!token)
      throw new BadRequestException(
        this.i18nService.translate('common.request.errors.token_not_found'),
      );
    return this.userService.verifyEmail(token);
  }
  @Get('/forgot-password')
  @IsPublicRoute()
  async forgotPassword(@Query('email') email: string) {
    if (!email)
      throw new NotFoundException(
        this.i18nService.translate('common.request.errors.email_not_found'),
      );
    return this.userService.forgotPassword(email);
  }
  @Post('/reset-password')
  @IsPublicRoute()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(dto);
  }
  @Get('/profile')
  async myProfile(@CurrentUser() user: AccessTokenPayload) {
    return this.userService.myProfile(user);
  }
  @Patch('/profile')
  async updateProfile(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ProfileUpdateRequestDto,
  ) {
    return this.userService.updateMyProfile(user, dto);
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch('/:id/status')
  @MessageResource('user', 'changeStatus')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusUpdateRequestDto,
  ) {
    return this.userService.changeStatus(id, dto);
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch('/:id/verify')
  async changeVerify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyUpdateRequestDto,
  ) {
    return this.userService.changeVerify(id, dto);
  }
  @HasRole(Role.ADMIN)
  @Patch('/:id/role')
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RoleUpdateRequestDto,
  ) {
    return this.userService.changeRole(id, dto);
  }
  @Get('')
  async findPublicUsers(@Query() query: QueryParamDto) {
    return this.userService.findPublicUsers(query);
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get('/admin')
  async findUsers(@Query() query: QueryParamDto) {
    return this.userService.findUsers(query);
  }
  @Get(':userId')
  async findDetail(
    @CurrentUser() user,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.findUserDetail(user, userId);
  }
}
