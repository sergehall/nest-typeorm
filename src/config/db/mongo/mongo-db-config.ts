import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConnectionEnums } from './enums/connection.enums';
import Configuration, { ConfigType } from '../../configuration';
import { EnvNamesEnums } from '../../enums/envNames.enums';
import { createConnection } from 'mongoose';
import { MongoDbConfigTypes } from './types/mongo-db-config.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConnection {
  constructor(protected configService: ConfigService<ConfigType, true>) {}

  static getMongoAtlasConnection() {
    return {
      provide: ConnectionEnums.ASYNC_CONNECTION,
      useFactory: async () => {
        const { ENV, dbConfig } = Configuration.getConfiguration();
        const uri = dbConfig.mongo.url.ATLAS_URI;
        let dbName = dbConfig.mongo.namesDatabase.DEV_DATABASE;
        if (ENV === EnvNamesEnums.PRODUCTION) {
          dbName = dbConfig.mongo.namesDatabase.PROD_NEST_DATABASE;
        }

        if (uri && dbName) {
          const connection = await createConnection(uri, {
            dbName: dbName,
          });
          console.log('Mongoose database connected.');
          return connection;
        }
        throw new BadGatewayException();
      },
    };
  }

  protected getValueUri(key: MongoDbConfigTypes, defaultValue: string): string {
    const expression =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regex = new RegExp(expression);
    const value = this.configService.get('dbConfig', {
      infer: true,
    }).mongo.url[key];
    if (!value) {
      if (!value.match(regex) || defaultValue !== undefined) {
        return defaultValue;
      } else {
        throw new InternalServerErrorException({
          message: `incorrect configuration , cannot be found ${key}`,
        });
      }
    }
    return value;
  }

  // getMongoUri(): string {
  //   return this.getValueUri('MONGO_URI_LOCAL', 'localhost://0.0.0.0');
  // }

  // getAtlasUri(): string {
  //   return this.getValueUri('ATLAS_URI', 'localhost://0.0.0.0');
  // }
}
