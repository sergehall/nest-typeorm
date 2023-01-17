import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { Mongoose } from 'mongoose';
import { NamesCollectionsEnums } from '../../infrastructure/database/enums/names-collections.enums';
import { ConnectionEnums } from '../../infrastructure/database/enums/connection.enums';
import {
  UsersDocument,
  UsersSchema,
} from '../../users/infrastructure/schemas/user.schema';

import {
  DevicesDocument,
  DevicesSchema,
} from '../../security-devices/infrastructure/schemas/devices.schema';
import {
  refreshTokenBlackListDocument,
  RefreshTokenBlacklistSchema,
} from './schemas/refreshToken-blacklist.schema';

export const authProviders = [
  {
    provide: ProvidersEnums.USER_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<UsersDocument>(
        NamesCollectionsEnums.USERS,
        UsersSchema,
        NamesCollectionsEnums.USERS,
      ),
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
  {
    provide: ProvidersEnums.BL_REFRESH_JWT_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<refreshTokenBlackListDocument>(
        NamesCollectionsEnums.REFRESH_TOKEN_BL,
        RefreshTokenBlacklistSchema,
        NamesCollectionsEnums.REFRESH_TOKEN_BL,
      ),
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
  {
    provide: ProvidersEnums.DEVICES_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<DevicesDocument>(
        NamesCollectionsEnums.DEVICES,
        DevicesSchema,
        NamesCollectionsEnums.DEVICES,
      ),
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
];
