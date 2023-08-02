import { BadGatewayException, Injectable } from '@nestjs/common';
import { Connection, createConnection } from 'mongoose';
import { BaseConfig } from '../../base/base-config';
import { EnvNamesEnums } from '../../enums/env-names.enums';

@Injectable()
export class MongoConnectionService extends BaseConfig {
  async getConnectionByType(connectionType: string): Promise<Connection> {
    switch (connectionType) {
      case 'atlas':
        return this.getAtlasConnection();
      case 'local':
        return this.getLocalConnection();
      default:
        throw new Error(`Invalid connectionType: ${connectionType}`);
    }
  }

  private async getAtlasConnection(): Promise<Connection> {
    const mongoDbConfig = await this.getValueMongoDatabase();
    const ENV = await this.getValueENV();
    const uri = mongoDbConfig.url.ATLAS_URI;
    let dbName = mongoDbConfig.namesDatabase.DEV_DATABASE;
    if (ENV === EnvNamesEnums.PRODUCTION) {
      dbName = mongoDbConfig.namesDatabase.PROD_NEST_DATABASE;
    }
    if (uri && dbName) {
      const connection = await createConnection(uri, {
        dbName: dbName,
      });
      console.log('Mongoose atlas database connected.');
      return connection;
    }
    throw new BadGatewayException();
  }

  private async getLocalConnection(): Promise<Connection> {
    const mongoDbConfig = await this.getValueMongoDatabase();
    const uri = mongoDbConfig.url.MONGO_URI_LOCAL;
    const dbName = mongoDbConfig.namesDatabase.TEST_DATABASE;
    if (uri && dbName) {
      const connection = await createConnection(uri, {
        dbName: dbName,
      });
      console.log('Mongoose local database connected.');
      return connection;
    }
    throw new BadGatewayException();
  }
}
