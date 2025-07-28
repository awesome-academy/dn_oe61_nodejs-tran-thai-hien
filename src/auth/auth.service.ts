import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AccessTokenPayload } from './interfaces/access-token-payload';
import { ForgotPasswordTokenPayload } from './interfaces/forgot-password-token-payload';
import { UserValidate } from './interfaces/user-validate';
import { VerifyEmailTokenPayload } from './interfaces/verify-email-token-payload';
import { I18nService } from 'nestjs-i18n';
import { CustomLogger } from 'src/common/logger/custom-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly i18nService: I18nService,
    private readonly loggerService: CustomLogger,
  ) {}
  async generateAccessToken(
    payload: AccessTokenPayload,
    options?: JwtSignOptions,
  ) {
    return await this.jwtService.signAsync(payload, options);
  }
  async verifyToken(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<UserValidate> {
    try {
      return await this.jwtService.verifyAsync<UserValidate>(token, options);
    } catch (error) {
      this.loggerService.error('Verify token failed', JSON.stringify(error));
      throw new UnauthorizedException(
        this.i18nService.translate('common.request.errors.tokenInvalidExpired'),
      );
    }
  }
  async generateVerifyEmailToken(
    payload: VerifyEmailTokenPayload,
    options?: JwtSignOptions,
  ) {
    return await this.jwtService.signAsync(payload, options);
  }
  async generateForgotPassword(
    payload: ForgotPasswordTokenPayload,
    options?: JwtSignOptions,
  ) {
    return await this.jwtService.signAsync(payload, options);
  }
}
