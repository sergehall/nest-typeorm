import { Inject, Injectable } from '@nestjs/common';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { Model } from 'mongoose';

import { JwtBlacklistDto } from '../dto/jwt-blacklist.dto';
import { refreshTokenBlackListDocument } from './schemas/refreshToken-blacklist.schema';

@Injectable()
export class BlacklistJwtRepository {
  constructor(
    @Inject(ProvidersEnums.BL_REFRESH_JWT_MODEL)
    private RefreshTokenBlackListModel: Model<refreshTokenBlackListDocument>,
  ) {}
  async findJWT(refreshToken: string): Promise<boolean> {
    const result = await this.RefreshTokenBlackListModel.findOne({
      refreshToken: { $eq: refreshToken },
    });
    return result !== null;
  }
  async addJWT(jwtBlacklistDto: JwtBlacklistDto): Promise<boolean> {
    try {
      const result = await this.RefreshTokenBlackListModel.create(
        {
          refreshToken: jwtBlacklistDto.refreshToken,
          expirationDate: jwtBlacklistDto.expirationDate,
        },
        { upsert: true, returnDocument: 'after' },
      );
      return result !== null;
    } catch (err) {
      return false;
    }
  }
  async clearingInvalidJWTFromBlackList() {
    return await this.RefreshTokenBlackListModel.deleteMany({
      expirationDate: { $lt: new Date().toISOString() },
    });
  }
}
