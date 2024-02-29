import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';

@Injectable()
export class EncryptConfig extends BaseConfig {
  async getPasswordHash(password: string): Promise<string> {
    return await this.getValueHash(password);
  }

  async getSaPasswordHash(): Promise<string> {
    return await this.getSaValueHash();
  }
}
