import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { Mongoose } from 'mongoose';
import {
  UsersDocument,
  UsersSchema,
} from '../../users/infrastructure/schemas/user.schema';
import { NamesCollectionsEnums } from '../../infrastructure/database/enums/names-collections.enums';
import { ConnectionEnums } from '../../infrastructure/database/enums/connection.enums';
import {
  EmailsConfirmCodeDocument,
  EmailsConfirmCodeSchema,
} from '../../mails/infrastructure/schemas/email-confirm-code.schema';
import {
  BBlogSchema,
  BBlogsDocument,
} from '../../bblogger/infrastructure/schemas/bblogs.schema';
import {
  PostsDocument,
  PostsSchema,
} from '../../posts/infrastructure/schemas/posts.schema';
import {
  LikeStatusPostSchema,
  LikeStatusPostsDocument,
} from '../../posts/infrastructure/schemas/like-status-posts.schemas';
import {
  DevicesDocument,
  DevicesSchema,
} from '../../security-devices/infrastructure/schemas/devices.schema';

export const saProviders = [
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
    provide: ProvidersEnums.BBLOG_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<BBlogsDocument>(
        NamesCollectionsEnums.BBLOGS,
        BBlogSchema,
        NamesCollectionsEnums.BBLOGS,
      ),
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
  {
    provide: ProvidersEnums.POST_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<PostsDocument>(
        NamesCollectionsEnums.POSTS,
        PostsSchema,
        NamesCollectionsEnums.POSTS,
      ),
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
  {
    provide: ProvidersEnums.LIKE_STATUS_POSTS_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<LikeStatusPostsDocument>(
        NamesCollectionsEnums.LIKE_STATUS_POST,
        LikeStatusPostSchema,
        NamesCollectionsEnums.LIKE_STATUS_POST,
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
