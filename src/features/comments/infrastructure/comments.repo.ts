import { KeyResolver } from '../../../common/helpers/key-resolver';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { CommentsEntity } from '../entities/comments.entity';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PartialTablesCommentsEntity } from '../entities/partialTablesComments.entity';
import {
  LikesInfo,
  ReturnCommentsEntity,
} from '../entities/return-comments.entity';
import { BannedFlagsDto } from '../../posts/dto/banned-flags.dto';
import {
  ParseQueriesDto,
  SortDirection,
} from '../../../common/query/dto/parse-queries.dto';
import { PagingParamsDto } from '../../../common/pagination/dto/paging-params.dto';
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';
import { ReturnCommentWithLikesInfoDto } from '../dto/return-comment-with-likes-info.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ReturnCommentsCountCommentsDto } from '../dto/return-comments-count-comments.dto';
import { LikeStatusCommentsEntity } from '../entities/like-status-comments.entity';

export class CommentsRepo {
  constructor(
    private readonly keyResolver: KeyResolver,
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
    @InjectRepository(LikeStatusCommentsEntity)
    private readonly likeCommentRepository: Repository<LikeStatusCommentsEntity>,
  ) {}

  async getCommentByIdWithoutLikes(id: string): Promise<CommentsEntity | null> {
    try {
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { dependencyIsBanned, isBanned } = bannedFlags;

      const comment = await this.commentsRepository.findBy({
        id,
        dependencyIsBanned,
        isBanned,
      });
      return comment[0] ? comment[0] : null;
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCommentWithLikesById(
    id: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnCommentWithLikesInfoDto | null> {
    // Retrieve banned flags
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    try {
      const comment: CommentsEntity[] = await this.commentsRepository.findBy({
        id,
        dependencyIsBanned,
        isBanned,
      });

      if (comment.length === 0) {
        return null;
      }

      const result: ReturnCommentWithLikesInfoDto[] =
        await this.commentsLikesAggregation(comment, currentUserDto);

      return result[0];
    } catch (error) {
      if (await this.isInvalidUUIDError(error)) {
        const userId = await this.extractUserIdFromError(error);
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCommentsWithLikesByPostId(
    postId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnCommentsCountCommentsDto> {
    try {
      // Retrieve banned flags
      const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
      const { dependencyIsBanned, isBanned } = bannedFlags;

      // Retrieve paging parameters
      const pagingParams: PagingParamsDto = await this.getPagingParams(
        queryData,
      );
      const { sortBy, direction, limit, offset } = pagingParams;

      // Retrieve the order field for sorting
      const orderByField = await this.getOrderField(sortBy);

      // Query comments and countPosts with pagination conditions
      const queryBuilder = this.commentsRepository
        .createQueryBuilder('comment')
        .where({ dependencyIsBanned })
        .andWhere({ isBanned })
        .innerJoinAndSelect('comment.post', 'post')
        .innerJoinAndSelect('comment.commentator', 'commentator')
        .andWhere('post.id = :postInfoPostId', { postInfoPostId: postId });

      queryBuilder.orderBy(orderByField, direction);

      const countComment = await queryBuilder.getCount();

      const comments = await queryBuilder.skip(offset).take(limit).getMany();

      if (comments.length === 0) {
        return {
          comments: [],
          countComments: countComment,
        };
      }

      // Retrieve comments with information about likes
      const commentsWithLikes = await this.commentsLikesAggregation(
        comments,
        currentUserDto,
      );

      return {
        comments: commentsWithLikes,
        countComments: countComment,
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createComments(
    post: PostsEntity,
    createCommentDto: CreateCommentDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ReturnCommentsEntity> {
    const commentsEntity: CommentsEntity = await this.creatCommentEntity(
      post,
      createCommentDto,
      currentUserDto,
    );

    try {
      const queryBuilder = this.commentsRepository
        .createQueryBuilder()
        .insert()
        .into(CommentsEntity)
        .values(commentsEntity)
        .returning(
          `"id", "content", "createdAt", "commentatorInfoUserId", "commentatorInfoUserLogin"`,
        );

      const result: InsertResult = await queryBuilder.execute();

      return await this.addLikesInfoAndTransformedComment(result.raw[0]);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new comment.',
      );
    }
  }

  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<boolean> {
    try {
      const updateResult = await this.commentsRepository.update(
        { id: commentId },
        { content: updateCommentDto.content },
      );

      return updateResult.affected === 1;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    return this.commentsRepository.manager.transaction(async (manager) => {
      try {
        // Delete likes comments associated with the comment
        await manager.delete(LikeStatusCommentsEntity, {
          comment: { id: commentId },
        });

        // Delete the comment itself
        const deleteResult = await manager.delete(CommentsEntity, {
          id: commentId,
        });

        if (deleteResult.affected && deleteResult.affected > 0) {
          console.log(`Comment with ID ${commentId} deleted.`);
          return true;
        } else {
          console.log(`No comment found with ID ${commentId}.`);
          return false;
        }
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException(error.message);
      }
    });
  }

  private async creatCommentEntity(
    post: PostsEntity,
    createCommentDto: CreateCommentDto,
    currentUserDto: CurrentUserDto,
  ): Promise<CommentsEntity> {
    const { content } = createCommentDto;

    const commentator = new UsersEntity();
    commentator.userId = currentUserDto.userId;
    commentator.login = currentUserDto.login;

    const blogOwner = new UsersEntity();
    blogOwner.userId = post.postOwner.userId;

    const blog = new BloggerBlogsEntity();
    blog.id = post.blog.id;
    blog.name = post.blog.name;

    const commentsEntity = new CommentsEntity();
    commentsEntity.id = uuid4().toString();
    commentsEntity.content = content;
    commentsEntity.createdAt = new Date().toISOString();
    commentsEntity.isBanned = false;
    commentsEntity.banDate = null;
    commentsEntity.banReason = null;
    commentsEntity.dependencyIsBanned = false;
    commentsEntity.isBanned = false;
    commentsEntity.blog = blog;
    commentsEntity.blogOwner = blogOwner;
    commentsEntity.post = post;
    commentsEntity.commentator = commentator;

    return commentsEntity;
  }

  private async addLikesInfoAndTransformedComment(
    comment: PartialTablesCommentsEntity,
  ): Promise<ReturnCommentsEntity> {
    const commentatorInfo = {
      userId: comment.commentatorInfoUserId,
      userLogin: comment.commentatorInfoUserLogin,
    };
    const likesInfo = new LikesInfo();
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo,
      likesInfo,
    };
  }

  private async getBannedFlags(): Promise<BannedFlagsDto> {
    return {
      commentatorInfoIsBanned: false,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
  }

  private async getPagingParams(
    queryData: ParseQueriesDto,
  ): Promise<PagingParamsDto> {
    const { sortDirection, pageSize, pageNumber } = queryData.queryPagination;

    const sortBy: string = await this.getSortBy(
      queryData.queryPagination.sortBy,
    );
    const direction: SortDirection = sortDirection;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

    return { sortBy, direction, limit, offset };
  }

  async commentsLikesAggregation(
    comments: CommentsEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<ReturnCommentsEntity[]> {
    const result: ReturnCommentsEntity[] = [];

    for (const comment of comments) {
      const commentId = comment.id; // Get the comment ID

      // Query like status data for the posts
      const likeStatusCommentsData: LikeStatusCommentsEntity[] =
        await this.likeCommentRepository
          .createQueryBuilder('likeStatusComments')
          .leftJoinAndSelect('likeStatusComments.comment', 'comment')
          .leftJoinAndSelect(
            'likeStatusComments.ratedCommentUser',
            'ratedCommentUser',
          )
          .where('likeStatusComments.comment.id = :commentId', { commentId })
          .orderBy('likeStatusComments.addedAt', 'DESC')
          .getMany();

      const likeCount = likeStatusCommentsData.filter(
        (post) => post.likeStatus === LikeStatusEnums.LIKE,
      ).length;
      const dislikeCount = likeStatusCommentsData.filter(
        (post) => post.likeStatus === LikeStatusEnums.DISLIKE,
      ).length;

      let myStatus: LikeStatusEnums = LikeStatusEnums.NONE;

      if (currentUserDto) {
        const myLikeStatusPost = likeStatusCommentsData.find(
          (post) => post.ratedCommentUser.userId === currentUserDto.userId,
        );

        if (myLikeStatusPost) {
          myStatus = myLikeStatusPost.likeStatus;
        }
      }

      result.push({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        commentatorInfo: {
          userId: comment.commentator.userId,
          userLogin: comment.commentator.login,
        },
        likesInfo: {
          likesCount: likeCount,
          dislikesCount: dislikeCount,
          myStatus: myStatus,
        },
      });
    }

    return result;
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      [
        'content',
        'postInfoTitle',
        'postInfoBlogName',
        'commentatorInfoUserLogin',
        'isBanned',
        'dependencyIsBanned',
        'banDate',
      ],
      'createdAt',
    );
  }

  private async getOrderField(field: string): Promise<string> {
    let orderByString;
    try {
      switch (field) {
        case 'postInfoTitle':
          orderByString = 'comment.post.postInfoTitle';
          break;
        case 'postInfoBlogName':
          orderByString = 'comment.blog.postInfoBlogName';
          break;
        case 'commentatorInfoUserLogin':
          orderByString = 'commentator.commentatorInfoUserLogin ';
          break;
        case 'isBanned':
          orderByString = 'comment.isBanned';
          break;
        case 'dependencyIsBanned':
          orderByString = 'comment.dependencyIsBanned';
          break;
        case 'banDate':
          orderByString = 'comment.banDate';
          break;
        case 'banReason':
          orderByString = 'comment.banReason';
          break;
        default:
          orderByString = 'comment.createdAt';
      }
      return orderByString;
    } catch (error) {
      console.log(error.message);
      throw new Error(
        'Invalid field in getOrderField(field: string)' + error.message,
      );
    }
  }

  private async isInvalidUUIDError(error: any): Promise<boolean> {
    return error.message.includes('invalid input syntax for type uuid');
  }

  private async extractUserIdFromError(error: any): Promise<string | null> {
    const match = error.message.match(/"([^"]+)"/);
    return match ? match[1] : null;
  }
}
