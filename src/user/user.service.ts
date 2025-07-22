import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role as RoleEntity, User } from '@prisma/client';
import { Role } from 'src/common/enums/role.enum';
import { omitData } from 'src/common/utils/data.util';
import { comparePassword, hashPassword } from 'src/common/utils/hash.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/requests/login.dto';
import { SignupDto } from './dto/requests/signup.dto';
import { LoginResponseDto } from './dto/responses/login-response.dto';
import { SignupResponseDto } from './dto/responses/signup-response.dto';
import { AuthService } from 'src/auth/auth.service';
import { accessTokenPayload } from 'src/auth/interfaces/access-token-payload';
@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}
  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    const userExistByEmail = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (userExistByEmail) throw new ConflictException('Email already exist');
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
    return this.buildSignupResponse(user);
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
  private buildSignupResponse(userData: User): SignupResponseDto {
    return this.excludeUserFieldDefault(userData);
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
}
