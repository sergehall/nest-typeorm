import { KeyResolver } from '../../../common/helpers/key-resolver';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository, SelectQueryBuilder } from 'typeorm';
import { CommentsEntity } from '../entities/comments.entity';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { LikesInfo, CommentViewModel } from '../view-models/comment.view-model';
import { BannedFlagsDto } from '../../posts/dto/banned-flags.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { CommentWithLikesInfoViewModel } from '../view-models/comment-with-likes-info.view-model';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { LikeStatusCommentsEntity } from '../entities/like-status-comments.entity';
import { LikesDislikesMyStatusInfoDto } from '../dto/likes-dislikes-my-status-info.dto';
import { SortDirectionEnum } from '../../../common/query/enums/sort-direction.enum';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';
import { PartialCommentsDto } from '../dto/partial-comments.dto';
import { CommentsAndCountDto } from '../dto/comments-and-count.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { LikeStatusCommentsRepo } from './like-status-comments.repo';

export class CommentsRepo {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
    private readonly likeStatusCommentsRepo: LikeStatusCommentsRepo,
    private readonly keyResolver: KeyResolver,
    private readonly uuidErrorResolver: UuidErrorResolver,
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
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCommentWithLikesById(
    id: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentWithLikesInfoViewModel | null> {
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

      const result: CommentWithLikesInfoViewModel[] =
        await this.commentsLikesAggregation(comment, currentUserDto);

      return result[0];
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(`Post with ID ${userId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
  async getCommentsWithLikesByPostId(
    postId: string,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentsAndCountDto> {
    try {
      const { pageNumber, pageSize } = queryData.queryPagination;
      const limit: number = pageSize;
      const offset: number = (pageNumber - 1) * limit;

      const queryBuilder = await this.createCommentsQueryBuilder(
        queryData,
        'postId',
        postId,
      );
      const countComment = await queryBuilder.getCount();

      const comments: CommentsEntity[] = await queryBuilder
        .skip(offset)
        .take(limit)
        .getMany();

      if (comments.length === 0) {
        return {
          comments: [],
          countComments: countComment,
        };
      }

      // Retrieve comments with information about likes
      const commentsWithLikes: CommentViewModel[] =
        await this.commentsLikesAggregation(comments, currentUserDto);

      return {
        comments: commentsWithLikes,
        countComments: countComment,
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCommentsWithLikesByUserId(
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto,
  ): Promise<CommentsAndCountDto> {
    const { pageNumber, pageSize } = queryData.queryPagination;
    const limit: number = pageSize;
    const offset: number = (pageNumber - 1) * limit;

    const queryBuilder = await this.createCommentsQueryBuilder(
      queryData,
      'commentatorId',
      currentUserDto.userId,
    );

    try {
      const countComment = await queryBuilder.getCount();

      const comments: CommentsEntity[] = await queryBuilder
        .skip(offset)
        .take(limit)
        .getMany();

      if (comments.length === 0) {
        return {
          comments: [],
          countComments: countComment,
        };
      }

      // Retrieve comments with information about likes
      const commentsWithLikes: CommentViewModel[] =
        await this.commentsLikesAggregation(comments, currentUserDto);

      return {
        comments: commentsWithLikes,
        countComments: countComment,
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
  private async createCommentsQueryBuilder(
    queryData: ParseQueriesDto,
    keyword: 'commentatorId' | 'postId',
    value: string,
  ): Promise<SelectQueryBuilder<CommentsEntity>> {
    // Retrieve banned flags
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    // Retrieve paging parameters
    const { sortBy, sortDirection } = queryData.queryPagination;
    const field: string = await this.getSortByField(sortBy);
    const direction: SortDirectionEnum = sortDirection;

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .innerJoinAndSelect('comment.post', 'post')
      .innerJoinAndSelect('comment.commentator', 'commentator');

    if (keyword === 'commentatorId') {
      queryBuilder.andWhere('commentator.userId = :commentatorId', {
        commentatorId: value,
      });
    } else if (keyword === 'postId') {
      queryBuilder.andWhere('post.id = :postId', {
        postId: value,
      });
    }
    queryBuilder.orderBy(`comment.${field}`, direction);

    return queryBuilder;
  }

  async createComments(
    post: PostsEntity,
    createCommentDto: CreateCommentDto,
    currentUserDto: CurrentUserDto,
  ): Promise<CommentViewModel> {
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
          `"id", "content", "createdAt", "commentatorId", "commentatorLogin"`,
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

  async commentsLikesAggregation(
    comments: CommentsEntity[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentViewModel[]> {
    const commentIds = comments.map((comment) => comment.id);

    const likesInfoArr: LikesDislikesMyStatusInfoDto[] =
      await this.likeStatusCommentsRepo.getCommentsLikesDislikesMyStatus(
        commentIds,
        currentUserDto,
      );

    return comments.map((comment: CommentsEntity): CommentViewModel => {
      const likesInfo: LikesDislikesMyStatusInfoDto | undefined =
        likesInfoArr.find(
          (result: LikesDislikesMyStatusInfoDto) => result.id === comment.id,
        );

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        commentatorInfo: {
          userId: comment.commentator.userId,
          userLogin: comment.commentator.login,
        },
        likesInfo: {
          likesCount: likesInfo ? parseInt(likesInfo.likesCount) : 0,
          dislikesCount: likesInfo ? parseInt(likesInfo.dislikesCount) : 0,
          myStatus: likesInfo ? likesInfo.myStatus : LikeStatusEnums.NONE,
        },
      };
    });
  }

  private async addLikesInfoAndTransformedComment(
    comment: PartialCommentsDto,
  ): Promise<CommentViewModel> {
    const commentatorInfo = {
      userId: comment.commentatorId,
      userLogin: comment.commentatorLogin,
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

  private async getSortByField(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      [
        'content',
        'postTitle',
        'blogName',
        'commentatorLogin',
        'isBanned',
        'dependencyIsBanned',
        'banDate',
      ],
      'createdAt',
    );
  }
}
