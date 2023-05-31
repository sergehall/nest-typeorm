import { createConnection } from 'mongoose';
import { ConnectionEnums } from './enums/connection.enums';
import { BadGatewayException } from '@nestjs/common';
import { getConfiguration } from '../../config/configuration';
import { EnvNamesEnums } from '../../config/throttle/enums/env-names.enums';

export const databaseProviders = [
  {
    provide: ConnectionEnums.ASYNC_CONNECTION,
    useFactory: async () => {
      const uri = getConfiguration().db.mongo.atlas.ATLAS_URI;
      let nameDatabase = getConfiguration().db.nameDatabase.DEV_DATABASE;
      if (getConfiguration().ENV === EnvNamesEnums.PRODUCTION) {
        nameDatabase = getConfiguration().db.nameDatabase.PROD_NEST_DATABASE;
      }
      if (uri && nameDatabase) {
        const connection = await createConnection(uri, {
          dbName: nameDatabase,
        });
        console.log('Mongoose connected');
        return connection;
      }
      throw new BadGatewayException();
    },
  },
];
