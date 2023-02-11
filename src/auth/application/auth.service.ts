import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersEntity } from '../../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import jwt_decode from 'jwt-decode';
import { PayloadDto } from '../dto/payload.dto';
import { AccessToken } from '../dto/accessToken.dto';
import { JwtConfig } from '../../config/jwt/jwt-config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private jwtConfig: JwtConfig,
  ) {}
  async validatePassword(
    loginOrEmail: string,
    password: string,
  ): Promise<UsersEntity | null> {
    const user = await this.usersService.findUserByLoginOrEmail(loginOrEmail);
    if (
      user &&
      !user.banInfo.isBanned &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      return user;
    }
    return null;
  }

  async signAccessJWT(user: UsersEntity): Promise<AccessToken> {
    const deviceId = uuid4().toString();
    const payload = { userId: user.id, email: user.email, deviceId: deviceId };
    const ACCESS_SECRET_KEY = this.jwtConfig.getAccSecretKey();
    const EXP_ACC_TIME = this.jwtConfig.getExpAccTime();
    if (!ACCESS_SECRET_KEY || !EXP_ACC_TIME)
      throw new InternalServerErrorException();
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: ACCESS_SECRET_KEY,
        expiresIn: EXP_ACC_TIME,
      }),
    };
  }
  async updateAccessJWT(currentPayload: PayloadDto): Promise<AccessToken> {
    const payload = {
      userId: currentPayload.userId,
      deviceId: currentPayload.deviceId,
    };
    const ACCESS_SECRET_KEY = this.jwtConfig.getAccSecretKey();
    const EXP_ACC_TIME = this.jwtConfig.getExpAccTime();
    if (!ACCESS_SECRET_KEY || !EXP_ACC_TIME)
      throw new InternalServerErrorException();
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: ACCESS_SECRET_KEY,
        expiresIn: EXP_ACC_TIME,
      }),
    };
  }

  async signRefreshJWT(user: UsersEntity) {
    const deviceId = uuid4().toString();
    const payload = { userId: user.id, email: user.email, deviceId: deviceId };
    const REFRESH_SECRET_KEY = this.jwtConfig.getRefSecretKey();
    const EXP_REF_TIME = this.jwtConfig.getExpRefTime();
    if (!REFRESH_SECRET_KEY || !EXP_REF_TIME)
      throw new InternalServerErrorException();
    return {
      refreshToken: this.jwtService.sign(payload, {
        secret: REFRESH_SECRET_KEY,
        expiresIn: EXP_REF_TIME,
      }),
    };
  }
  async updateRefreshJWT(currentPayload: PayloadDto) {
    const payload = {
      userId: currentPayload.userId,
      deviceId: currentPayload.deviceId,
    };
    const REFRESH_SECRET_KEY = this.jwtConfig.getRefSecretKey();
    const EXP_REF_TIME = this.jwtConfig.getExpRefTime();
    if (!REFRESH_SECRET_KEY || !EXP_REF_TIME)
      throw new InternalServerErrorException();
    return {
      refreshToken: this.jwtService.sign(payload, {
        secret: REFRESH_SECRET_KEY,
        expiresIn: EXP_REF_TIME,
      }),
    };
  }
  async validAccessJWT(accessToken: string): Promise<PayloadDto | null> {
    const ACCESS_SECRET_KEY = this.jwtConfig.getAccSecretKey();
    if (!ACCESS_SECRET_KEY) throw new InternalServerErrorException();
    try {
      const result = await this.jwtService.verify(accessToken, {
        secret: ACCESS_SECRET_KEY,
      });
      return result;
    } catch (err) {
      return null;
    }
  }
  async validRefreshJWT(refreshToken: string): Promise<PayloadDto | null> {
    const REFRESH_SECRET_KEY = this.jwtConfig.getRefSecretKey();
    if (!REFRESH_SECRET_KEY) throw new InternalServerErrorException();
    try {
      const result = await this.jwtService.verify(refreshToken, {
        secret: REFRESH_SECRET_KEY,
      });
      return result;
    } catch (err) {
      return null;
    }
  }

  async decode(JWT: string): Promise<PayloadDto> {
    return jwt_decode(JWT);
  }
}
