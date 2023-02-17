import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { Mongoose } from 'mongoose';
import { NamesCollectionsEnums } from '../../../infrastructure/database/enums/names-collections.enums';
import { ConnectionEnums } from '../../../infrastructure/database/enums/connection.enums';
import {
  PostsDocument,
  PostsSchema,
} from '../../posts/infrastructure/schemas/posts.schema';
import {
  LikeStatusPostSchema,
  LikeStatusPostsDocument,
} from '../../posts/infrastructure/schemas/like-status-posts.schemas';
import { BBlogsSchema, BBlogsDocument } from './schemas/blogger-blogs.schema';
import {
  UsersDocument,
  UsersSchema,
} from '../../users/infrastructure/schemas/user.schema';
import {
  BBlogsBannedUserDocument,
  BBlogsBannedUsersSchema,
} from './schemas/blogger-blogs-banned-users.schema';
import {
  CommentsDocument,
  CommentsSchema,
} from '../../comments/infrastructure/schemas/comments.schema';

export const bloggerBlogsProviders = [
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
    provide: ProvidersEnums.BBLOG_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<BBlogsDocument>(
        NamesCollectionsEnums.BBLOGS,
        BBlogsSchema,
        NamesCollectionsEnums.BBLOGS,
      ),
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
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
    provide: ProvidersEnums.BBLOG_BANNED_USER_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<BBlogsBannedUserDocument>(
        NamesCollectionsEnums.BBLOGS_BANNED_USERS,
        BBlogsBannedUsersSchema,
        NamesCollectionsEnums.BBLOGS_BANNED_USERS,
      ),
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
  {
    provide: ProvidersEnums.COMMENT_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<CommentsDocument>(
        NamesCollectionsEnums.COMMENTS,
        CommentsSchema,
        NamesCollectionsEnums.COMMENTS,
      ),
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
];
