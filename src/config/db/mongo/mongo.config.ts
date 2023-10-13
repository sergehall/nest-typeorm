import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../../base/base-config';
import { MongoDatabaseConfigTypes } from './types/mongo-db-config.types';

@Injectable()
export class MongoConfig extends BaseConfig {
  async getMongoLocalAndAtlasValue(): Promise<MongoDatabaseConfigTypes> {
    return await this.getValueMongoDatabase();
  }

  async getENV(): Promise<string> {
    return await this.getValueENV();
  }
}
