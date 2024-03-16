import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';

@Injectable()
export class NodeEnvConfig extends BaseConfig {
  async getENV(): Promise<string> {
    return await this.getValueENV();
  }
}
