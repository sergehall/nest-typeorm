import { BadGatewayException, Injectable } from '@nestjs/common';
import Configuration from '../../configuration';
import { EnvNamesEnums } from '../../enums/envNames.enums';
import { Connection, createConnection } from 'mongoose';

@Injectable()
export class MongoConnectionService {
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
    const { ENV, db } = Configuration.getConfiguration();
    const uri = db.mongo.url.ATLAS_URI;
    let dbName = db.mongo.namesDatabase.DEV_DATABASE;
    if (ENV === EnvNamesEnums.PRODUCTION) {
      dbName = db.mongo.namesDatabase.PROD_NEST_DATABASE;
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
    const { db } = Configuration.getConfiguration();
    const uri = db.mongo.url.MONGO_URI_LOCAL;
    const dbName = db.mongo.namesDatabase.TEST_DATABASE;
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
