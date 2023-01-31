import { createConnection } from 'mongoose';
import { ConnectionEnums } from './enums/connection.enums';
import { BadGatewayException } from '@nestjs/common';
import { getConfiguration } from '../../config/configuration';
import { EnvNamesEnums } from './enums/env-names.enums';

export const databaseProviders = [
  {
    provide: ConnectionEnums.ASYNC_CONNECTION,
    useFactory: async () => {
      const uri = getConfiguration().mongoose.uri.ATLAS_URI;
      let nameDatabase = getConfiguration().database.DEV_DATABASE;
      if (getConfiguration().ENV === EnvNamesEnums.PRODUCTION) {
        nameDatabase = getConfiguration().database.PROD_NEST_DATABASE;
      }
      if (uri && nameDatabase) {
        const connection = await createConnection(uri + '/' + nameDatabase);
        console.log('Mongoose connected.');
        return connection;
      }
      throw new BadGatewayException();
    },
  },
];
