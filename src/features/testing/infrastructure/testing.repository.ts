import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsersDocument } from '../../users/infrastructure/schemas/user.schema';
import { PostsDocument } from '../../posts/infrastructure/schemas/posts.schema';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { LikeStatusPostsDocument } from '../../posts/infrastructure/schemas/like-status-posts.schemas';
import { LikeStatusCommentDocument } from '../../comments/infrastructure/schemas/like-status-comments.schema';
import { CommentsDocument } from '../../comments/infrastructure/schemas/comments.schema';
import { EmailsConfirmCodeDocument } from '../../mails/infrastructure/schemas/email-confirm-code.schema';
import { DevicesDocument } from '../../security-devices/infrastructure/schemas/devices.schema';
import { refreshTokenBlackListDocument } from '../../auth/infrastructure/schemas/refreshToken-blacklist.schema';
import { BBlogsDocument } from '../../blogger-blogs/infrastructure/schemas/blogger-blogs.schema';
import { BBlogsBannedUserDocument } from '../../blogger-blogs/infrastructure/schemas/blogger-blogs-banned-users.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @Inject(ProvidersEnums.USER_MODEL)
    private UsersModel: Model<UsersDocument>,
    @Inject(ProvidersEnums.POST_MODEL)
    private PostsModel: Model<PostsDocument>,
    @Inject(ProvidersEnums.LIKE_STATUS_POSTS_MODEL)
    private LikeStatusPostModel: Model<LikeStatusPostsDocument>,
    @Inject(ProvidersEnums.LIKE_STATUS_COMMENTS_MODEL)
    private LikeStatusCommentModel: Model<LikeStatusCommentDocument>,
    @Inject(ProvidersEnums.COMMENT_MODEL)
    private CommentsModel: Model<CommentsDocument>,
    @Inject(ProvidersEnums.CONFIRM_CODE_MODEL)
    private EmailsConfirmModel: Model<EmailsConfirmCodeDocument>,
    @Inject(ProvidersEnums.BL_REFRESH_JWT_MODEL)
    private JwtRefreshBlacklistModel: Model<refreshTokenBlackListDocument>,
    @Inject(ProvidersEnums.DEVICES_MODEL)
    private MyModelDevicesModel: Model<DevicesDocument>,
    @Inject(ProvidersEnums.BBLOG_MODEL)
    private BBlogsModel: Model<BBlogsDocument>,
    @Inject(ProvidersEnums.BBLOG_BANNED_USER_MODEL)
    private BBannedUsersModel: Model<BBlogsBannedUserDocument>,
  ) {}
  async removeAllCollections(): Promise<boolean> {
    // delete all Collections
    await this.UsersModel.deleteMany({});
    await this.BBlogsModel.deleteMany({});
    await this.PostsModel.deleteMany({});
    await this.CommentsModel.deleteMany({});
    await this.LikeStatusPostModel.deleteMany({});
    await this.LikeStatusCommentModel.deleteMany({});
    await this.EmailsConfirmModel.deleteMany({});
    await this.JwtRefreshBlacklistModel.deleteMany({});
    await this.MyModelDevicesModel.deleteMany({});
    await this.BBannedUsersModel.deleteMany({});
    return true;
  }
}
