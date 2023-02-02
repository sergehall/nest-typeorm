import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base-config';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration';

@Injectable()
export class JwtConfig extends BaseConfig {
  constructor(configService: ConfigService<ConfigType, true>) {
    super(configService);
  }
  getMongoUri(): string | undefined {
    return this.getValueUri('MONGO_URI', 'localhost://0.0.0.0');
  }
  getAtlasUri(): string | undefined {
    return this.getValueUri('ATLAS_URI', 'localhost://0.0.0.0');
  }
}
