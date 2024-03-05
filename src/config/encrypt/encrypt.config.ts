import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';

@Injectable()
export class EncryptConfig extends BaseConfig {
  async encryptPassword(password: string): Promise<string> {
    return await this.getValueHash(password);
  }
}
