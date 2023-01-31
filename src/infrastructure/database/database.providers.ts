import { createConnection } from 'mongoose';
import { ConnectionEnums } from './enums/connection.enums';
import { BadGatewayException } from '@nestjs/common';
import { getConfiguration } from '../../config/configuration';

export const databaseProviders = [
  {
    provide: ConnectionEnums.ASYNC_CONNECTION,
    useFactory: async () => {
      const uri = getConfiguration().mongoose.uri.ATLAS_URI;
      const database = getConfiguration().database.NEST_DATABASE;
      if (uri && database) {
        const connection = await createConnection(uri + '/' + database);
        console.log('Mongoose connected.');
        return connection;
      }
      throw new BadGatewayException();
    },
  },
];
