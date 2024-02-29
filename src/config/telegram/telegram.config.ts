import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { TokenIncubatorTest34 } from './types/tokens.types';

@Injectable()
export class TelegramConfig extends BaseConfig {
  async getTokenIncubator(
    tokenIncubatorTest34: TokenIncubatorTest34,
  ): Promise<string> {
    return await this.getIncubatorTest34Token(tokenIncubatorTest34);
  }
}
