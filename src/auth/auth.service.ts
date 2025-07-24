import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { UserValidate } from './interfaces/user-validate';
import { accessTokenPayload } from './interfaces/access-token-payload';

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
}
