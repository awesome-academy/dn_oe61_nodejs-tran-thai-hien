import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role as RoleEntity, User, UserStatus } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { accessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { VerifyEmailTokenPayload } from 'src/auth/interfaces/verify-email-token-payload';
import { PrismaError } from 'src/common/enums/prisma-error.enum';
import { Role } from 'src/common/enums/role.enum';
import { omitData } from 'src/common/utils/data.util';
import {
  formatDateTime,
  parseExpiresInToDate,
} from 'src/common/utils/date.util';
import { comparePassword, hashPassword } from 'src/common/utils/hash.util';
import { VerifyEmailPayload } from 'src/mail/interfaces/verify-email-payload.interface';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SEND_MAIL_STATUS, SendMailStatus } from './constant/email.constant';
import { REGISTER_TYPE } from './constant/register.constant';
import { VERIFY_EMAIL_STATUS } from './constant/verify-email.constant';
import { LoginDto } from './dto/requests/login.dto';
import { SignupDto } from './dto/requests/signup.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { ResendVerifyEmailResponseDto } from './dto/responses/resend-verify-email.dto';
import { SignupResponseDto } from './dto/responses/signup-response.dto';
import { VerifyEmailResponseDto } from './dto/responses/verify-email.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
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
        verficationLink: `${appUrl}/users/resend-verify-email?email=${userExistByEmail.email}`,
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
    const verifyEmailMailPayload: VerifyEmailPayload = {
      recipientUserName: user.userName,
      expiresAt,
      token: tokenVerifyEmail,
      recipientName: user.name,
    };
    const responseSendMail = await this.sendVerifyEmail(
      verifyEmailMailPayload,
      user.email,
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
    console.log('Resend mail exires:: ' + expiresIn);
    const payload = await this.generateVerifyEmailPayload(
      userExistByEmail,
      expiresIn,
    );
    const status = await this.sendVerifyEmail(payload, userExistByEmail.email);
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
  async verifyEmail(token: string): Promise<VerifyEmailResponseDto> {
    try {
      const payload = await this.authService.verifyToken(token);
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user)
        return { verifyStatus: VERIFY_EMAIL_STATUS.INVALID_OR_EXPIRED };
      if (user.isVerified)
        return { verifyStatus: VERIFY_EMAIL_STATUS.ALREADY_VERIFIED };

      const userUpdated = await this.prismaService.user.update({
        where: { id: user.id },
        data: { isVerified: true, status: UserStatus.ACTIVE },
      });
      return {
        verifyStatus: VERIFY_EMAIL_STATUS.SUCCESS,
        user: {
          email: userUpdated.email,
          name: userUpdated.name,
          userName: userUpdated.userName,
          isVerified: userUpdated.isVerified,
        },
      };
    } catch (error) {
      console.error(`Error verify confirm email - caused by: ${error}`);
      return { verifyStatus: VERIFY_EMAIL_STATUS.INVALID_OR_EXPIRED };
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
  private async generateVerifyEmailPayload(
    user: User,
    expiresIn: string,
  ): Promise<VerifyEmailPayload> {
    const verifyEmailTokenPayload: VerifyEmailTokenPayload = {
      sub: user.id,
      userName: user.userName,
    };
    const tokenVerifyEmail = await this.authService.generateVerifyEmailToken(
      verifyEmailTokenPayload,
      { expiresIn },
    );
    const expiresAt = formatDateTime(parseExpiresInToDate(expiresIn));
    const verifyEmailMailPayload: VerifyEmailPayload = {
      recipientUserName: user.userName,
      expiresAt,
      token: tokenVerifyEmail,
      recipientName: user.name,
    };
    return verifyEmailMailPayload;
  }
  private async sendVerifyEmail(
    payload: VerifyEmailPayload,
    to: string,
  ): Promise<SendMailStatus> {
    try {
      await this.mailService.sendVerifyEmail(to, payload);
      return SEND_MAIL_STATUS.SENT;
    } catch (err) {
      console.error(`Send email failed to ${to} caused by ${err}`);
      return SEND_MAIL_STATUS.FAILED;
    }
  }
}
