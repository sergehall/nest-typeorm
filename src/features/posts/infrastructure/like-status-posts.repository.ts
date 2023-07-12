import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { LikeStatusPostEntity } from '../entities/like-status-post.entity';
import { LikeStatusPostsDocument } from './schemas/like-status-posts.schemas';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { PostsEntity } from '../entities/posts.entity';
import { StatusLike } from '../../../infrastructure/database/enums/like-status.enums';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PostsReturnEntity } from '../entities/posts-without-ownerInfo.entity';
import { PostsRawSqlEntity } from '../entities/posts-raw-sql.entity';
import { LikeStatusPostsRawSqlRepository } from './like-status-posts-raw-sql.repository';
import { NewestLikes } from './schemas/posts.schema';

@Injectable()
export class LikeStatusPostsRepository {
  constructor(
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
    @Inject(ProvidersEnums.LIKE_STATUS_POSTS_MODEL)
    private likeStatusPostModel: Model<LikeStatusPostsDocument>,
  ) {}
  async updateLikeStatusPost(
    dtoLikeStatusPost: LikeStatusPostEntity,
  ): Promise<boolean> {
    const result = await this.likeStatusPostModel
      .findOneAndUpdate(
        {
          $and: [
            { postId: dtoLikeStatusPost.postId },
            { userId: dtoLikeStatusPost.userId },
          ],
        },
        {
          blogId: dtoLikeStatusPost.blogId,
          postId: dtoLikeStatusPost.postId,
          userId: dtoLikeStatusPost.userId,
          isBanned: dtoLikeStatusPost.isBanned,
          login: dtoLikeStatusPost.login,
          likeStatus: dtoLikeStatusPost.likeStatus,
          addedAt: dtoLikeStatusPost.addedAt,
        },
        { upsert: true, returnDocument: 'after' },
      )
      .lean();

    return result !== null;
  }

  async preparationPostsForReturn2(
    postArray: PostsRawSqlEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsReturnEntity[]> {
    try {
      const filledPosts: PostsReturnEntity[] = [];
      for (const i in postArray) {
        const postId = postArray[i].id;
        const isBanned = false;
        const currentPost: PostsRawSqlEntity = postArray[i];
        if (postArray[i].postOwnerIsBanned) {
          continue;
        }
        // getting likes count
        const like = 'Like';
        const likesCount =
          await this.likeStatusPostsRawSqlRepository.countLikesDislikes(
            postId,
            isBanned,
            like,
          );

        // getting dislikes count
        const dislike = 'Dislike';
        const dislikesCount =
          await this.likeStatusPostsRawSqlRepository.countLikesDislikes(
            postId,
            isBanned,
            dislike,
          );
        // getting the status of the post owner
        let ownLikeStatus = StatusLike.NONE;
        if (currentUserDto) {
          const findOwnPost =
            await this.likeStatusPostsRawSqlRepository.findOne(
              postId,
              currentUserDto.id,
              isBanned,
            );
          if (findOwnPost[0]) {
            ownLikeStatus = findOwnPost[0].likeStatus;
          }
        }
        // getting 3 last likes
        const limitLikes = 3;
        const likeStatus = StatusLike.LIKE;
        const newestLikes: NewestLikes[] =
          await this.likeStatusPostsRawSqlRepository.findNewestLikes(
            postId,
            likeStatus,
            isBanned,
            limitLikes,
          );
        const currentPostWithLastThreeLikes = {
          id: currentPost.id,
          title: currentPost.title,
          shortDescription: currentPost.shortDescription,
          content: currentPost.content,
          blogId: currentPost.blogId,
          blogName: currentPost.blogName,
          createdAt: currentPost.createdAt,
          extendedLikesInfo: {
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: ownLikeStatus,
            newestLikes: newestLikes,
          },
        };

        filledPosts.push(currentPostWithLastThreeLikes);
      }
      return filledPosts;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async preparationPostsForReturn(
    postArray: PostsEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsReturnEntity[]> {
    const filledPosts: PostsReturnEntity[] = [];
    for (const i in postArray) {
      const postId = postArray[i].id;
      const currentPost: PostsEntity = postArray[i];
      if (postArray[i].postOwnerInfo.isBanned) {
        continue;
      }
      // getting likes count
      const likesCount = await this.likeStatusPostModel
        .countDocuments({
          $and: [
            { postId: postId },
            { likeStatus: StatusLike.LIKE },
            { isBanned: false },
          ],
        })
        .lean();

      // getting dislikes count
      const dislikesCount = await this.likeStatusPostModel
        .countDocuments({
          $and: [
            { postId: postId },
            { likeStatus: StatusLike.DISLIKE },
            { isBanned: false },
          ],
        })
        .lean();
      // getting the status of the post owner
      let ownLikeStatus = StatusLike.NONE;
      if (currentUserDto) {
        const findOwnPost = await this.likeStatusPostModel.findOne({
          $and: [
            { postId: postId },
            { userId: currentUserDto.id },
            { isBanned: false },
          ],
        });
        if (findOwnPost) {
          ownLikeStatus = findOwnPost.likeStatus;
        }
      }
      // getting 3 last likes
      const newestLikes = await this.likeStatusPostModel
        .find(
          {
            $and: [
              { postId: postId },
              { likeStatus: StatusLike.LIKE },
              { isBanned: false },
            ],
          },
          {
            _id: false,
            __v: false,
            postId: false,
            blogId: false,
            likeStatus: false,
            isBanned: false,
          },
        )
        .sort({ addedAt: -1 })
        .limit(3)
        .lean();
      const currentPostWithLastThreeLikes = {
        id: currentPost.id,
        title: currentPost.title,
        shortDescription: currentPost.shortDescription,
        content: currentPost.content,
        blogId: currentPost.blogId,
        blogName: currentPost.blogName,
        createdAt: currentPost.createdAt,
        extendedLikesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus: ownLikeStatus,
          newestLikes: newestLikes,
        },
      };

      filledPosts.push(currentPostWithLastThreeLikes);
    }
    return filledPosts;
  }
  async changeBanStatusPostsInLikeStatusRepo(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    const updateLikes = await this.likeStatusPostModel.updateMany(
      {
        userId: userId,
      },
      { isBanned: isBanned },
    );
    return updateLikes.acknowledged;
  }
  async changeBanStatusPostsLikeStatusByUserIdBlogId(
    userId: string,
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    const updateLikes = await this.likeStatusPostModel.updateMany(
      { $and: [{ userId: userId }, { blogId: blogId }] },
      { isBanned: isBanned },
    );
    return updateLikes.acknowledged;
  }
  async changeBanStatusPostsLikeStatusByBlogId(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    const updateLikes = await this.likeStatusPostModel.updateMany(
      { blogId: blogId },
      { isBanned: isBanned },
    );
    return updateLikes.acknowledged;
  }
}
