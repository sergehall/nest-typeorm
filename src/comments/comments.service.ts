import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationDto } from '../infrastructure/common/pagination/dto/pagination.dto';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { UsersEntity } from '../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import { StatusLike } from '../infrastructure/database/enums/like-status.enums';
import { CommentsRepository } from './infrastructure/comments.repository';
import { LikeStatusDto } from './dto/like-status.dto';
import { LikeStatusCommentEntity } from './entities/like-status-comment.entity';
import { User } from '../users/infrastructure/schemas/user.schema';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../ability/roles/action.enum';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { LikeStatusCommentsRepository } from './infrastructure/like-status-comments.repository';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { CommentsEntity } from './entities/comments.entity';

@Injectable()
export class CommentsService {
  constructor(
    protected pagination: Pagination,
    protected commentsRepository: CommentsRepository,
    private readonly postsService: PostsService,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected likeStatusCommentsRepository: LikeStatusCommentsRepository,
    private usersService: UsersService,
  ) {}
  async createComment(
    postId: string,
    createCommentDto: CreateCommentDto,
    user: UsersEntity,
  ): Promise<CommentsEntity> {
    const post = await this.postsService.checkPostInDB(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const newComment: CommentsEntity = {
      id: uuid4().toString(),
      content: createCommentDto.content,
      userId: user.id,
      userLogin: user.login,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.NONE,
      },
    };

    return await this.commentsRepository.createComment(postId, newComment);
  }
  async findCommentById(commentId: string, currentUser: UsersEntity | null) {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) throw new NotFoundException();
    const commentNotBannedUser =
      await this.usersService.commentsWithoutBannedUser([comment]);
    if (commentNotBannedUser.length === 0) throw new NotFoundException();
    const filledComments =
      await this.likeStatusCommentsRepository.preparationCommentsForReturn(
        [comment],
        currentUser,
      );
    return filledComments[0];
  }

  async findCommentsByPostId(
    queryPagination: PaginationDto,
    postId: string,
    currentUser: UsersEntity | null,
  ) {
    const post = await this.postsService.checkPostInDB(postId);
    if (!post) throw new NotFoundException();
    const comments = await this.commentsRepository.findCommentsByPostId(postId);
    if (!comments || comments.length === 0) {
      return {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };
    }
    const commentsNotBannedUser =
      await this.usersService.commentsWithoutBannedUser(comments);
    let desc = 1;
    let asc = -1;
    let field: 'userId' | 'userLogin' | 'content' | 'createdAt' = 'createdAt';
    if (
      queryPagination.sortDirection === 'asc' ||
      queryPagination.sortDirection === 'ascending' ||
      queryPagination.sortDirection === 1
    ) {
      desc = -1;
      asc = 1;
    }
    if (
      queryPagination.sortBy === 'content' ||
      queryPagination.sortBy === 'userLogin'
    ) {
      field = queryPagination.sortBy;
    }
    const totalCount = commentsNotBannedUser.length;
    const allComments = commentsNotBannedUser.sort(
      await byField(field, asc, desc),
    );

    async function byField(
      field: 'userId' | 'userLogin' | 'content' | 'createdAt',
      asc: number,
      desc: number,
    ) {
      return (a: CommentsEntity, b: CommentsEntity) =>
        a[field] > b[field] ? asc : desc;
    }
    const startIndex =
      (queryPagination.pageNumber - 1) * queryPagination.pageSize;
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);

    const commentsSlice = allComments.slice(
      startIndex,
      startIndex + queryPagination.pageSize,
    );
    const filledComments =
      await this.likeStatusCommentsRepository.preparationCommentsForReturn(
        commentsSlice,
        currentUser,
      );

    return {
      pagesCount: pagesCount,
      page: queryPagination.pageNumber,
      pageSize: queryPagination.pageSize,
      totalCount: totalCount,
      items: filledComments,
    };
  }
  async changeLikeStatusComment(
    commentId: string,
    likeStatusDto: LikeStatusDto,
    currentUser: User,
  ): Promise<boolean> {
    const findComment = await this.commentsRepository.findCommentById(
      commentId,
    );
    if (!findComment) {
      throw new NotFoundException();
    }
    const likeStatusCommEntity: LikeStatusCommentEntity = {
      commentId: commentId,
      userId: currentUser.id,
      likeStatus: likeStatusDto.likeStatus,
      createdAt: new Date().toISOString(),
    };
    return await this.likeStatusCommentsRepository.updateLikeStatusComment(
      likeStatusCommEntity,
    );
  }

  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    currentUser: User,
  ) {
    const findComment = await this.commentsRepository.findCommentById(
      commentId,
    );
    if (!findComment) throw new NotFoundException();
    try {
      const ability = this.caslAbilityFactory.createForComments({
        id: currentUser.id,
      });
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: findComment.userId,
      });
      return await this.commentsRepository.updateComment(
        commentId,
        updateCommentDto,
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  async removeComment(commentId: string, currentUser: User) {
    const findComment = await this.commentsRepository.findCommentById(
      commentId,
    );
    if (!findComment) throw new NotFoundException();
    try {
      const ability = this.caslAbilityFactory.createForComments({
        id: currentUser.id,
      });
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: findComment.userId,
      });
      return this.commentsRepository.removeComment(commentId);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
