import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Pagination } from '../../common/pagination/pagination';
import {
  NewestLikes,
  PostsReturnEntity,
} from '../entities/posts-without-ownerInfo.entity';
import { ConvertFiltersForDB } from '../../common/convert-filters/convertFiltersForDB';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { PostsRawSqlRepository } from '../infrastructure/posts-raw-sql.repository';
import { PostsRawSqlEntity } from '../entities/posts-raw-sql.entity';
import { LikeStatusPostsRawSqlRepository } from '../infrastructure/like-status-posts-raw-sql.repository';
import { StatusLike } from '../../../infrastructure/database/enums/like-status.enums';
import { BlogIdParams } from '../../common/params/blogId.params';
import { userNotHavePermission } from '../../../exception-filter/errors-messages';

@Injectable()
export class PostsService {
  constructor(
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
    protected postsRawSqlRepository: PostsRawSqlRepository,
    protected likeStatusPostsRawSqlRepository: LikeStatusPostsRawSqlRepository,
  ) {}
  async openFindPosts(
    queryData: ParseQueryType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PaginationTypes> {
    const posts: PostsRawSqlEntity[] =
      await this.postsRawSqlRepository.openFindPosts(queryData);
    const filledPosts = await this.preparationPostsForReturn(
      posts,
      currentUserDto,
    );
    const totalCountPosts = await this.postsRawSqlRepository.totalCountPosts();
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
    queryData: ParseQueryType,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PaginationTypes> {
    const posts: PostsRawSqlEntity[] | null =
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
    queryData: ParseQueryType,
    currentUserDto: CurrentUserDto,
  ): Promise<PaginationTypes> {
    const posts: PostsRawSqlEntity[] | null =
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
  ): Promise<PostsReturnEntity | null> {
    const post = await this.postsRawSqlRepository.findPostByPostId(id);
    if (!post) throw new NotFoundException();
    const filledPost = await this.preparationPostsForReturn(
      [post],
      currentUserDto,
    );
    return filledPost[0];
  }

  async preparationPostsForReturn(
    postArray: PostsRawSqlEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<PostsReturnEntity[]> {
    try {
      const filledPosts: PostsReturnEntity[] = [];
      for (const i in postArray) {
        const postId = postArray[i].id;
        const isBanned = false;
        const currentPost: PostsRawSqlEntity = postArray[i];
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
