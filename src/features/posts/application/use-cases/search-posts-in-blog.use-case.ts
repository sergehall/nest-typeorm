import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BlogIdParams } from '../../../../common/query/params/blogId.params';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { TablesPostsEntity } from '../../entities/tables-posts-entity';
import {
  NewestLikes,
  ReturnPostsEntity,
} from '../../entities/return-posts-entity.entity';
import { LikeStatusEnums } from '../../../../config/db/mongo/enums/like-status.enums';
import { InternalServerErrorException } from '@nestjs/common';
import { LikeStatusPostsRawSqlRepository } from '../../infrastructure/like-status-posts-raw-sql.repository';

export class SearchPostsInBlogCommand {
  constructor(
    public params: BlogIdParams,
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}
@CommandHandler(SearchPostsInBlogCommand)
export class SearchPostsInBlogUseCase
  implements ICommandHandler<SearchPostsInBlogCommand>
{
  constructor(
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
  ) {}
  async execute(command: SearchPostsInBlogCommand) {
    const { params, queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;
    const posts: TablesPostsEntity[] =
      await this.postsRawSqlRepository.findPostsByBlogId(params, queryData);

    if (posts.length === 0) {
      return {
        pagesCount: pageNumber,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        items: [],
      };
    }
    const filledPosts = await this.preparationPostsForReturn(
      posts,
      currentUserDto,
    );
    const totalCountPosts: number =
      await this.postsRawSqlRepository.totalCountPostsByBlogId(params);

    const pagesCount: number = Math.ceil(totalCountPosts / pageSize);
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCountPosts,
      items: filledPosts,
    };
  }

  private async preparationPostsForReturn(
    postArray: TablesPostsEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity[]> {
    try {
      const filledPosts: ReturnPostsEntity[] = [];
      for (const i in postArray) {
        const postId = postArray[i].id;
        const isBanned = false;
        const currentPost: TablesPostsEntity = postArray[i];
        if (postArray[i].dependencyIsBanned) {
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
        let ownLikeStatus = LikeStatusEnums.NONE;
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
        const likeStatus = LikeStatusEnums.LIKE;
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
}
