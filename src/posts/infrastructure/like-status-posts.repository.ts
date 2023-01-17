import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { LikeStatusPostEntity } from '../entities/like-status-post.entity';
import { LikeStatusPostsDocument } from './schemas/like-status-posts.schemas';
import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { PostsEntity } from '../entities/posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { StatusLike } from '../../infrastructure/database/enums/like-status.enums';

@Injectable()
export class LikeStatusPostsRepository {
  constructor(
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
          postId: dtoLikeStatusPost.postId,
          userId: dtoLikeStatusPost.userId,
          login: dtoLikeStatusPost.login,
          likeStatus: dtoLikeStatusPost.likeStatus,
          addedAt: dtoLikeStatusPost.addedAt,
        },
        { upsert: true, returnDocument: 'after' },
      )
      .lean();

    return result !== null;
  }
  async preparationPostsForReturn(
    postArray: PostsEntity[],
    currentUser: UsersEntity | null,
  ): Promise<PostsEntity[]> {
    const filledPosts: PostsEntity[] = [];
    for (const i in postArray) {
      const postId = postArray[i].id;
      const currentPost: PostsEntity = postArray[i];

      // getting likes count
      const likesCount = await this.likeStatusPostModel
        .countDocuments({
          $and: [{ postId: postId }, { likeStatus: StatusLike.LIKE }],
        })
        .lean();

      // getting dislikes count
      const dislikesCount = await this.likeStatusPostModel
        .countDocuments({
          $and: [{ postId: postId }, { likeStatus: StatusLike.DISLIKE }],
        })
        .lean();
      // getting the status of the post owner
      let ownLikeStatus = StatusLike.NONE;
      if (currentUser) {
        const findOwnPost = await this.likeStatusPostModel.findOne({
          $and: [{ postId: postId }, { userId: currentUser.id }],
        });
        if (findOwnPost) {
          ownLikeStatus = findOwnPost.likeStatus;
        }
      }

      // getting 3 last likes
      const newestLikes = await this.likeStatusPostModel
        .find(
          {
            $and: [{ postId: postId }, { likeStatus: StatusLike.LIKE }],
          },
          {
            _id: false,
            __v: false,
            postId: false,
            likeStatus: false,
            'extendedLikesInfo.newestLikes._id': false,
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
}
