import {
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
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';
import { MessageResource } from 'src/common/decorators/resource.decorator';
import { ApiResponseForgotPasword } from 'src/swagger/examples/users/forgot-password.example';
import { ApiResponseGetPorfileExample } from 'src/swagger/examples/users/get-profile.example';
import { ApiResponseGetPublicDetailExample } from 'src/swagger/examples/users/get-public-detail.example';
import { ApiResponseGetPublicUser } from 'src/swagger/examples/users/get-public-user.example';
import { ApiResponseLogin } from 'src/swagger/examples/users/login-response.example';
import { ApiResponseLogoutExample } from 'src/swagger/examples/users/logout-response.example';
import { ApiResponseResendVerifyEmaiLExample } from 'src/swagger/examples/users/resend-verify-email-response.example';
import { ApiResponseResetPasswordExample } from 'src/swagger/examples/users/reset-password.example';
import { ApiResponseSignup } from 'src/swagger/examples/users/signup-response.example';
import { ApiResponseUpdateUserExample } from 'src/swagger/examples/users/update-user.example';
import { ApiResponseVerifyEmailExample } from 'src/swagger/examples/users/verify-email.example';
import { LoginDto } from './dto/requests/login.dto';
import { LogoutRequestDto } from './dto/requests/logout-request.dto';
import { ProfileUpdateRequestDto } from './dto/requests/profile-update.dto';
import { ResetPasswordDto } from './dto/requests/reset-password';
import { SignupDto } from './dto/requests/signup.dto';
import { UserService } from './user.service';
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
    private readonly configService: ConfigService,
  ) {}
  @ApiResponseSignup()
  @Post('/signup')
  @IsPublicRoute()
  @MessageResource('user', 'signup')
  async signup(@Body() dto: SignupDto) {
    return this.userService.signup(dto);
  }
  @ApiResponseLogin()
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
      },
    });
  }
  @ApiExcludeEndpoint()
  @IsPublicRoute()
  @Get('/login')
  @Render('pages/login')
  getLoginForm() {}
  @ApiResponseLogoutExample()
  @ApiBearerAuth('access-token')
  @Post('/logout')
  async logout(
    @Body() dto: LogoutRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const dataResponse = {
      success: true,
      message: this.i18nService.translate('common.user.action.logout.success'),
      payload: null,
    };
    const tokenFromBody = dto?.token;
    const tokenFromCookie = req.cookies['accessToken'] as string;
    const token = tokenFromBody || tokenFromCookie;
    if (!token) return res.send(dataResponse);
    await this.userService.logout(token);
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
    return res.send(dataResponse);
  }
  @MessageResource('user', 'sendVerifyEmail')
  @ApiResponseResendVerifyEmaiLExample()
  @Get('/resend-verify-email')
  @IsPublicRoute()
  async resendVerifyEmail(@Query('email') email: string) {
    if (!email)
      throw new NotFoundException(
        this.i18nService.translate('common.request.errors.emailNotfound'),
      );
    return this.userService.resendVerifyEmail(email);
  }
  @ApiResponseVerifyEmailExample()
  @Get('/verify-email')
  @IsPublicRoute()
  async verifyEmail(@Query('token') token: string) {
    if (!token)
      throw new NotFoundException(
        this.i18nService.translate('common.request.errors.tokenNotFound'),
      );
    return this.userService.verifyEmail(token);
  }
  @ApiResponseForgotPasword()
  @Get('/forgot-password')
  @IsPublicRoute()
  async forgotPassword(@Query('email') email: string) {
    if (!email)
      throw new NotFoundException(
        this.i18nService.translate('common.request.errors.emailNotFound'),
      );
    return this.userService.forgotPassword(email);
  }
  @ApiResponseResetPasswordExample()
  @Post('/reset-password')
  @IsPublicRoute()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(dto);
  }
  @ApiResponseGetPorfileExample()
  @ApiBearerAuth('access-token')
  @Get('/profile')
  async myProfile(@CurrentUser() user: AccessTokenPayload) {
    return this.userService.myProfile(user);
  }
  @ApiResponseUpdateUserExample()
  @ApiBearerAuth('access-token')
  @Patch('/profile')
  async updateProfile(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ProfileUpdateRequestDto,
  ) {
    return this.userService.updateMyProfile(user, dto);
  }
  @ApiResponseGetPublicUser()
  @ApiBearerAuth('access-token')
  @Get('')
  async findPublicUsers(@Query() query: QueryParamDto) {
    return this.userService.findPublicUsers(query);
  }
  @ApiResponseGetPublicDetailExample()
  @ApiBearerAuth('access-token')
  @Get(':userId')
  async findDetail(
    @CurrentUser() user: AccessTokenPayload,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.findUserDetail(user, userId);
  }
}
