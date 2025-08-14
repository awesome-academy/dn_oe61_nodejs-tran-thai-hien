import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AccessTokenPayload } from './interfaces/access-token-payload';
import { ForgotPasswordTokenPayload } from './interfaces/forgot-password-token-payload';
import { UserValidate } from './interfaces/user-validate';
import { VerifyEmailTokenPayload } from './interfaces/verify-email-token-payload';
import { I18nService } from 'nestjs-i18n';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { ConfigService } from '@nestjs/config';
import { ViewBookingTokenPayload } from './interfaces/view-booking-token.payload';
import { BookingTokenValidate } from './interfaces/booking-token-validate';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly i18nService: I18nService,
    private readonly loggerService: CustomLogger,
    private readonly configService: ConfigService,
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
  async generateViewBookingToken(payload: ViewBookingTokenPayload) {
    const expiresIn = this.configService.get<string>(
      'jwt.viewBookinTokenExpiresIn',
      '1h',
    );
    return await this.jwtService.signAsync(payload, {
      expiresIn,
    });
  }
  async verifyViewBookingToken(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<BookingTokenValidate> {
    try {
      return await this.jwtService.verifyAsync<BookingTokenValidate>(
        token,
        options,
      );
    } catch (error) {
      this.loggerService.error(
        'Verify token booking failed',
        JSON.stringify(error),
      );
      throw new UnauthorizedException(
        this.i18nService.translate('common.request.errors.tokenInvalidExpired'),
      );
    }
  }
}
