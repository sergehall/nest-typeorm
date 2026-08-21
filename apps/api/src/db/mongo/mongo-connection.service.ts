import { BadGatewayException, Injectable } from '@nestjs/common';
import { Connection, createConnection } from 'mongoose';
import { MongoConfig } from '../../config/db/mongo/mongo.config';
import { EnvNamesEnums } from '../../config/enums/env-names.enums';
import { NodeEnvConfig } from '../../config/node-env/node-env.config';

@Injectable()
export class MongoConnectionService {
  constructor(
    private readonly mongoConfig: MongoConfig,
    private readonly nodeEnvConfig: NodeEnvConfig,
  ) {}

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
    const uri = await this.mongoConfig.getMongoConfig('ATLAS_URI');
    const dbName = await this.getDatabaseName();

    if (uri && dbName) {
      const connection = await createConnection(uri, { dbName });
      console.log('Mongoose atlas database connected.');
      return connection;
    }
    throw new BadGatewayException();
  }

  private async getLocalConnection(): Promise<Connection> {
    const localUri = await this.mongoConfig.getMongoConfig('MONGO_URI_LOCAL');
    const dbName = await this.getDatabaseName();

    if (localUri && dbName) {
      const connection = await createConnection(localUri, { dbName });
      console.log('Mongoose local database connected.');
      return connection;
    }
    throw new BadGatewayException();
  }

  private async getDatabaseName(): Promise<string> {
    const ENV = await this.nodeEnvConfig.getENV();
    if (ENV === EnvNamesEnums.PRODUCTION) {
      return this.mongoConfig.getMongoConfig('PROD_NEST_DATABASE');
    }
    return this.mongoConfig.getMongoConfig('DEV_DATABASE');
  }
}
