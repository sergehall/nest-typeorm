import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  NewestLikes,
  ReturnPostsEntity,
} from '../entities/posts-without-ownerInfo.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PostsRawSqlRepository } from '../infrastructure/posts-raw-sql.repository';
import { LikeStatusPostsRawSqlRepository } from '../infrastructure/like-status-posts-raw-sql.repository';
import { StatusLike } from '../../../config/db/mongo/enums/like-status.enums';
import { BlogIdParams } from '../../common/query/params/blogId.params';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { TablesPostsEntity } from '../entities/tables-posts-entity';
import { userNotHavePermission } from '../../../exception-filter/custom-errors-messages';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';

@Injectable()
export class PostsService {
  constructor(
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
  ) {}
  async openFindPosts(
    queryData: ParseQueriesType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PaginationTypes> {
    const posts: TablesPostsEntity[] =
      await this.postsRawSqlRepository.openFindPosts(queryData);
    const filledPosts = await this.preparationPostsForReturn(
      posts,
      currentUserDto,
    );
    const totalCountPosts =
      await this.postsRawSqlRepository.openTotalCountPosts();
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

  async openFindPostsByBlogId(
    params: BlogIdParams,
    queryData: ParseQueriesType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PaginationTypes> {
    const posts: TablesPostsEntity[] | null =
      await this.postsRawSqlRepository.findPostsByBlogId(params, queryData);
    if (!posts || posts.length === 0) {
      return {
        pagesCount: queryData.queryPagination.pageNumber,
        page: queryData.queryPagination.pageNumber,
        pageSize: queryData.queryPagination.pageSize,
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

  async openFindPostByPostId(
    id: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnPostsEntity | null> {
    const post = await this.postsRawSqlRepository.findPostByPostId(id);
    if (!post) throw new NotFoundException('Not Found posts.');
    const filledPost = await this.preparationPostsForReturn(
      [post],
      currentUserDto,
    );
    return filledPost[0];
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
}
