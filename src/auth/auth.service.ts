import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { accessTokenPayload } from './interfaces/access-token-payload';
import { UserValidate } from './interfaces/user-validate';
import { VerifyEmailTokenPayload } from './interfaces/verify-email-token-payload';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  async generateAccessToken(
    payload: accessTokenPayload,
    options?: JwtSignOptions,
  ) {
    return await this.jwtService.signAsync(payload, options);
  }
  async verifyToken(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<UserValidate> {
    return await this.jwtService.verifyAsync<UserValidate>(token, options);
  }
  async generateVerifyEmailToken(
    payload: VerifyEmailTokenPayload,
    options?: JwtSignOptions,
  ) {
    return await this.jwtService.signAsync(payload, options);
  }
}
