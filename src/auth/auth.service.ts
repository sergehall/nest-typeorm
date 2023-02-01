import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersEntity } from '../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import jwt_decode from 'jwt-decode';
import { JwtBlacklistDto } from './dto/jwt-blacklist.dto';
import { BlacklistJwtRepository } from './infrastructure/blacklist-jwt.repository';
import { PayloadDto } from './dto/payload.dto';
import { AccessToken } from './dto/accessToken.dto';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../config/configuration';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private blacklistJwtRepository: BlacklistJwtRepository,
    private configService: ConfigService<ConfigType, true>,
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
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt', {
          infer: true,
        }).ACCESS_SECRET_KEY,
        expiresIn: this.configService.get('jwt', {
          infer: true,
        }).EXP_ACC_TIME,
      }),
    };
  }
  async updateAccessJWT(currentPayload: PayloadDto): Promise<AccessToken> {
    const payload = {
      userId: currentPayload.userId,
      deviceId: currentPayload.deviceId,
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt', {
          infer: true,
        }).ACCESS_SECRET_KEY,
        expiresIn: this.configService.get('jwt', {
          infer: true,
        }).EXP_ACC_TIME,
      }),
    };
  }

  async signRefreshJWT(user: UsersEntity) {
    const deviceId = uuid4().toString();
    const payload = { userId: user.id, email: user.email, deviceId: deviceId };
    return {
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt', {
          infer: true,
        }).REFRESH_SECRET_KEY,
        expiresIn: this.configService.get('jwt', {
          infer: true,
        }).EXP_REF_TIME,
      }),
    };
  }
  async updateRefreshJWT(currentPayload: PayloadDto) {
    const payload = {
      userId: currentPayload.userId,
      deviceId: currentPayload.deviceId,
    };
    return {
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt', {
          infer: true,
        }).REFRESH_SECRET_KEY,
        expiresIn: this.configService.get('jwt', {
          infer: true,
        }).EXP_REF_TIME,
      }),
    };
  }
  async validAccessJWT(accessToken: string): Promise<PayloadDto | null> {
    try {
      const result = await this.jwtService.verify(accessToken, {
        secret: this.configService.get('jwt', {
          infer: true,
        }).REFRESH_SECRET_KEY,
      });
      return result;
    } catch (err) {
      return null;
    }
  }
  async validRefreshJWT(refreshToken: string): Promise<PayloadDto | null> {
    try {
      const result = await this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt', {
          infer: true,
        }).REFRESH_SECRET_KEY,
      });
      return result;
    } catch (err) {
      return null;
    }
  }
  async decode(JWT: string): Promise<PayloadDto> {
    return jwt_decode(JWT);
  }
  async addRefreshTokenToBl(currentToken: JwtBlacklistDto): Promise<boolean> {
    return await this.blacklistJwtRepository.addJWT(currentToken);
  }
}
