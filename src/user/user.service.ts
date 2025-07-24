import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role as RoleEntity, User, UserStatus } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { accessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { ForgotPasswordTokenPayload } from 'src/auth/interfaces/forgot-password-token-payload';
import { VerifyEmailTokenPayload } from 'src/auth/interfaces/verify-email-token-payload';
import { PrismaError } from 'src/common/enums/prisma-error.enum';
import { Role } from 'src/common/enums/role.enum';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { omitData } from 'src/common/utils/data.util';
import {
  formatDateTime,
  parseExpiresInToDate,
} from 'src/common/utils/date.util';
import { comparePassword, hashPassword } from 'src/common/utils/hash.util';
import { MAIL_TYPE, MailType } from 'src/mail/constants/mail-type.constant';
import { MailPayloadDto } from 'src/mail/dto/mail-payload.dto';
import { ContentMailUserPayload } from 'src/mail/interfaces/content-mail-user.interface';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SEND_MAIL_STATUS, SendMailStatus } from './constant/email.constant';
import { REGISTER_TYPE } from './constant/register.constant';
import { VERIFY_USER_STATUS } from './constant/verify-email.constant';
import { LoginDto } from './dto/requests/login.dto';
import { ResetPasswordDto } from './dto/requests/reset-password';
import { SignupDto } from './dto/requests/signup.dto';
import { ForgotPasswordResponse } from './dto/responses/forgot-password-response';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { ResendVerifyEmailResponseDto } from './dto/responses/resend-verify-email.dto';
import { SignupResponseDto } from './dto/responses/signup-response.dto';
import { VerifyUserResponseDto } from './dto/responses/verify-email.dto';
import { MailErrorCode } from 'src/mail/constants/mail-error.constant';
import { MailException } from 'src/mail/exceptions/mail.exception';
@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly loggerService: CustomLogger,
  ) {}
  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    const expiresIn = this.configService.get<string>(
      'jwt.verifyEmailExpiresIn',
      '1h',
    );
    console.log('Signup expires in:: ' + expiresIn);
    const expiresAt = formatDateTime(parseExpiresInToDate(expiresIn));
    const userExistByEmail = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userExistByEmail && !userExistByEmail.isVerified) {
      const appUrl = this.configService.get<string>('app.url');
      return {
        type: REGISTER_TYPE.PENDING_VERIFY,
        expiresAt,
        verificationLink: `${appUrl}/users/resend-verify-email?email=${userExistByEmail.email}`,
      };
    }
    if (userExistByEmail && userExistByEmail.isVerified)
      throw new ConflictException('Email already exist');
    const userExistByUserName = await this.prismaService.user.findUnique({
      where: {
        userName: dto.userName,
      },
    });
    if (userExistByUserName)
      throw new ConflictException('Username already exist');
    const hashedPassword = await hashPassword(dto.password);
    const data: Prisma.UserCreateInput = {
      name: dto.name,
      email: dto.email,
      userName: dto.userName,
      password: hashedPassword,
      role: {
        connect: {
          name: Role.USER,
        },
      },
    };
    const user = await this.prismaService.user.create({
      data,
    });

    const verifyEmailTokenPayload: VerifyEmailTokenPayload = {
      sub: user.id,
      userName: user.userName,
    };
    const tokenVerifyEmail = await this.authService.generateVerifyEmailToken(
      verifyEmailTokenPayload,
      { expiresIn },
    );
    const verifyEmailMailPayload: ContentMailUserPayload = {
      recipientUserName: user.userName,
      expiresAt,
      token: tokenVerifyEmail,
      recipientName: user.name,
    };
    const responseSendMail = await this.sendUserEmail(
      verifyEmailMailPayload,
      user.email,
      MAIL_TYPE.VERIFY_EMAIL,
    );
    return this.buildSignupResponse(user, responseSendMail);
  }
  async resendVerifyEmail(
    email: string,
  ): Promise<ResendVerifyEmailResponseDto> {
    const userExistByEmail = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!userExistByEmail || userExistByEmail.isVerified)
      throw new BadRequestException('Email is invalid or already verified');
    const expiresIn = this.configService.get<string>(
      'jwt.verifyEmailExpiresIn',
      '1h',
    );
    const payload = await this.generateContentEmailUserPayload(
      userExistByEmail,
      expiresIn,
      MAIL_TYPE.VERIFY_EMAIL,
    );
    const status = await this.sendUserEmail(
      payload,
      userExistByEmail.email,
      MAIL_TYPE.VERIFY_EMAIL,
    );
    const expiresAt = formatDateTime(parseExpiresInToDate(expiresIn));
    return {
      sendMailStatus: status,
      expiresAt: expiresAt,
    };
  }
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const userByUserName = await this.prismaService.user.findUnique({
      where: {
        userName: dto.userName,
      },
      include: {
        role: true,
      },
    });
    if (!userByUserName)
      throw new UnauthorizedException('Invalid user credentials');
    const isComparePassword = await comparePassword(
      dto.password,
      userByUserName.password,
    );
    // if (
    //   !userByUserName.isVerified &&
    //   userByUserName.status == UserStatus.PENDING
    // ) {
    //   throw new ForbiddenException('User is not verified yet');
    // }
    // if (userByUserName.status == UserStatus.DEACTIVED) {
    //   throw new ForbiddenException('User is deactived');
    // }
    if (!isComparePassword)
      throw new UnauthorizedException('Invalid user credentials');
    const payload: accessTokenPayload = {
      sub: userByUserName.id,
      userName: userByUserName.userName,
      role: userByUserName.role.name,
    };
    const accessToken = await this.authService.generateAccessToken(payload);
    return this.buildLoginResponse(userByUserName, accessToken);
  }
  async logout(token: string) {
    const data: Prisma.TokenBlackListCreateInput = {
      token: token,
    };
    try {
      await this.prismaService.tokenBlackList.create({
        data,
      });
      return {
        message: 'Logout successfully',
      };
    } catch (err) {
      const error = err as Prisma.PrismaClientKnownRequestError;
      if (error.code === PrismaError.UNIQUE_CONSTRAINT.toString()) {
        throw new ConflictException('Token already exists');
      }
      throw err;
    }
  }
  async verifyEmail(token: string): Promise<VerifyUserResponseDto> {
    try {
      const payload = await this.authService.verifyToken(token);
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) return { verifyStatus: VERIFY_USER_STATUS.INVALID_OR_EXPIRED };
      if (user.isVerified)
        return { verifyStatus: VERIFY_USER_STATUS.ALREADY_VERIFIED };

      const userUpdated = await this.prismaService.user.update({
        where: { id: user.id },
        data: { isVerified: true, status: UserStatus.ACTIVE },
      });
      return {
        verifyStatus: VERIFY_USER_STATUS.SUCCESS,
        user: {
          email: userUpdated.email,
          name: userUpdated.name,
          userName: userUpdated.userName,
          isVerified: userUpdated.isVerified,
        },
      };
    } catch (error) {
      this.loggerService.error('Verify email failed', JSON.stringify(error));
      return { verifyStatus: VERIFY_USER_STATUS.INVALID_OR_EXPIRED };
    }
  }
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const expiresIn = this.configService.get<string>(
      'jwt.forgotPasswordExpiresIn',
      '1h',
    );
    const userExistByEmail = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!userExistByEmail) throw new NotFoundException('User not found');
    const payload = await this.generateContentEmailUserPayload(
      userExistByEmail,
      expiresIn,
      MAIL_TYPE.FORGOT_PASWORD,
    );
    const status = await this.sendUserEmail(
      payload,
      userExistByEmail.email,
      MAIL_TYPE.FORGOT_PASWORD,
    );
    return {
      sendMailStatus: status,
    };
  }
  async resetPassword(dto: ResetPasswordDto): Promise<VerifyUserResponseDto> {
    try {
      console.log('DTO:: ', dto);
      const payload = await this.authService.verifyToken(dto.token);
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) return { verifyStatus: VERIFY_USER_STATUS.INVALID_OR_EXPIRED };
      const hashedPassword = await hashPassword(dto.newPassword);
      const userUpdated = await this.prismaService.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      return {
        verifyStatus: VERIFY_USER_STATUS.SUCCESS,
        user: {
          email: userUpdated.email,
          name: userUpdated.name,
          userName: userUpdated.userName,
          isVerified: userUpdated.isVerified,
        },
      };
    } catch (error) {
      this.loggerService.error('Reset password error', JSON.stringify(error));
      return { verifyStatus: VERIFY_USER_STATUS.INVALID_OR_EXPIRED };
    }
  }
  private buildSignupResponse(
    userData: User,
    status: SendMailStatus,
  ): SignupResponseDto {
    return {
      type: REGISTER_TYPE.NEW_REGISTER,
      sendMailStatus: status,
      user: {
        name: userData.name,
        userName: userData.userName,
        email: userData.email,
        isVerified: userData.isVerified,
      },
    };
  }
  private buildLoginResponse(
    userData: User & { role: RoleEntity },
    accessToken: string,
  ): LoginResponseDto {
    const userExcludeFieldDefault = this.excludeUserFieldDefault(userData);
    return {
      ...userExcludeFieldDefault,
      role: userData.role.name,
      accessToken,
    };
  }
  private excludeUserFieldDefault(
    userData: User,
    excluedKeys: (keyof User)[] = [
      'password',
      'roleId',
      'createdAt',
      'deletedAt',
    ],
  ) {
    return omitData(userData, excluedKeys);
  }
  private async generateContentEmailUserPayload(
    user: User,
    expiresIn: string,
    type: MailType,
  ): Promise<ContentMailUserPayload> {
    let token: string;
    console.log('Type:: ' + type);
    if (type == MAIL_TYPE.FORGOT_PASWORD) {
      const forgotPasswordTokenPayload: ForgotPasswordTokenPayload = {
        sub: user.id,
        userName: user.userName,
      };
      token = await this.authService.generateForgotPassword(
        forgotPasswordTokenPayload,
        {
          expiresIn,
        },
      );
    } else {
      const verifyEmailTokenPayload: VerifyEmailTokenPayload = {
        sub: user.id,
        userName: user.userName,
      };
      token = await this.authService.generateVerifyEmailToken(
        verifyEmailTokenPayload,
        { expiresIn },
      );
    }
    const expiresAt = formatDateTime(parseExpiresInToDate(expiresIn));
    const contentMailUserPayload: ContentMailUserPayload = {
      recipientUserName: user.userName,
      expiresAt,
      token: token,
      recipientName: user.name,
    };
    return contentMailUserPayload;
  }
  private async sendUserEmail(
    payload: ContentMailUserPayload,
    to: string,
    type: MailType,
  ): Promise<SendMailStatus> {
    const mailPayLoad: MailPayloadDto = {
      to,
      type,
      ...payload,
    };
    try {
      await this.mailService.sendUserMail(mailPayLoad);
      return SEND_MAIL_STATUS.SENT;
    } catch (error) {
      let message: string;
      let caused: string | undefined;
      if (error instanceof MailException) {
        message = this.getErrorMessageSendMail(error.code);
      } else {
        message = 'SEND EMAIL FAILED';
        caused = JSON.stringify(error);
      }
      this.loggerService.error(message, caused, UserService.name);
      return SEND_MAIL_STATUS.FAILED;
    }
  }
  private getErrorMessageSendMail(code: MailErrorCode): string {
    switch (code) {
      case MailErrorCode.TIME_OUT:
        return 'The email sending request timed out';
      case MailErrorCode.TEMPLATE_ERROR:
        return 'The email template could not be loaded.';
      case MailErrorCode.INVALID_RECIPIENT:
        return 'The recipient email address is invalid.';
      case MailErrorCode.INVALID_PAYLOAD:
        return 'Payload send email invalid';
      default:
        return 'An unexpected error occurred while sending the email.';
    }
  }
}
