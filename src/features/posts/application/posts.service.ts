import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../infrastructure/like-status-posts-raw-sql.repository';
import { BlogIdParams } from '../../common/query/params/blogId.params';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { TablesPostsEntity } from '../entities/tables-posts-entity';
import { userNotHavePermission } from '../../../exception-filter/custom-errors-messages';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { CommandBus } from '@nestjs/cqrs';
import {
  NewestLikes,
  ReturnPostsEntity,
} from '../entities/return-posts-entity.entity';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { BloggerBlogsRawSqlRepository } from '../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}

  async openFindPostsByBlogId(
    params: BlogIdParams,
    queryData: ParseQueriesType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PaginationTypes> {
    const { pageSize, pageNumber } = queryData.queryPagination;

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
    const totalCountPosts =
      await this.postsRawSqlRepository.totalCountPostsByBlogId(params);
    console.log(totalCountPosts, 'totalCountPosts');
    console.log(pageSize, 'pageSize');
    const pagesCount = Math.ceil(totalCountPosts / pageSize);
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCountPosts,
      items: filledPosts,
    };
  }

  async findPostsByBlogId(
    params: BlogIdParams,
    queryData: ParseQueriesType,
    currentUserDto: CurrentUserDto,
  ): Promise<PaginationTypes> {
    const posts: TablesPostsEntity[] | null =
      await this.postsRawSqlRepository.findPostsByBlogId(params, queryData);
    if (!posts || posts.length === 0) {
      throw new NotFoundException('BlogId not found');
    }
    if (posts[0].postOwnerId !== currentUserDto?.id) {
      throw new HttpException(userNotHavePermission, HttpStatus.FORBIDDEN);
    }
    const filledPosts = await this.preparationPostsForReturn(
      posts,
      currentUserDto,
    );
    const totalCountPosts =
      await this.postsRawSqlRepository.totalCountPostsByBlogId(params);
    const pagesCount = Math.ceil(
      totalCountPosts / queryData.queryPagination.pageSize,
    );
    return {
      pagesCount: pagesCount,
      page: queryData.queryPagination.pageNumber,
      pageSize: queryData.queryPagination.pageSize,
      totalCount: totalCountPosts,
      items: filledPosts,
    };
  }

  async preparationPostsForReturn(
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
