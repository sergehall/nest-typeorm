import { BadGatewayException, Injectable } from '@nestjs/common';
import { EnvNamesEnums } from '../../env-names.enums/envNames.enums';
import { Connection, createConnection } from 'mongoose';
import { BaseConfig } from '../../base/base-config';

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
    const dbConfig = this.getValueDatabase();
    const ENV = this.getValueENV();
    const uri = dbConfig.mongo.url.ATLAS_URI;
    let dbName = dbConfig.mongo.namesDatabase.DEV_DATABASE;
    if (ENV === EnvNamesEnums.PRODUCTION) {
      dbName = dbConfig.mongo.namesDatabase.PROD_NEST_DATABASE;
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
    const dbConfig = this.getValueDatabase();
    const uri = dbConfig.mongo.url.MONGO_URI_LOCAL;
    const dbName = dbConfig.mongo.namesDatabase.TEST_DATABASE;
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
