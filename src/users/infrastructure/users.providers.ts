import { UsersDocument, UsersSchema } from './schemas/user.schema';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { ConnectionEnums } from '../../infrastructure/database/enums/connection.enums';
import { Mongoose } from 'mongoose';
import { NamesCollectionsEnums } from '../../infrastructure/database/enums/names-collections.enums';
import {
  EmailsConfirmCodeDocument,
  EmailsConfirmCodeSchema,
} from '../../mails/infrastructure/schemas/email-confirm-code.schema';
import {
  refreshTokenBlackListDocument,
  RefreshTokenBlacklistSchema,
} from '../../auth/infrastructure/schemas/refreshToken-blacklist.schema';

export const usersProviders = [
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
    provide: ProvidersEnums.CONFIRM_CODE_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<EmailsConfirmCodeDocument>(
        NamesCollectionsEnums.EMAILS_CONFIRM_CODES,
        EmailsConfirmCodeSchema,
        NamesCollectionsEnums.EMAILS_CONFIRM_CODES,
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
];
