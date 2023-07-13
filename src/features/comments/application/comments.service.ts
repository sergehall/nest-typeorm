import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { Pagination } from '../../common/pagination/pagination';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { PostsService } from '../../posts/application/posts.service';
import { CommandBus } from '@nestjs/cqrs';
import {
  FillingCommentsDataCommand,
  FillingCommentsDataCommand2,
} from './use-cases/filling-comments-data.use-case';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { CommentsRawSqlRepository } from '../infrastructure/comments-raw-sql.repository';
import { FilledCommentEntity } from '../entities/filledComment.entity';
import { CommentsReturnEntity } from '../entities/comments-return.entity';

@Injectable()
export class CommentsService {
  constructor(
    protected pagination: Pagination,
    protected commentsRepository: CommentsRepository,
    protected commentsRawSqlRepository: CommentsRawSqlRepository,
    protected postsService: PostsService,
    protected commandBus: CommandBus,
  ) {}

  async findCommentById(
    commentId: string,
    currentUserDto: CurrentUserDto | null,
  ): Promise<CommentsReturnEntity> {
    const comment = await this.commentsRawSqlRepository.findCommentById(
      commentId,
    );
    if (!comment || comment.commentatorInfoIsBanned)
      throw new NotFoundException();
    const filledComments: FilledCommentEntity[] = await this.commandBus.execute(
      new FillingCommentsDataCommand2([comment], currentUserDto),
    );
    return {
      id: filledComments[0].id,
      content: filledComments[0].content,
      createdAt: filledComments[0].createdAt,
      commentatorInfo: {
        userId: filledComments[0].commentatorInfo.userId,
        userLogin: filledComments[0].commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: filledComments[0].likesInfo.likesCount,
        dislikesCount: filledComments[0].likesInfo.dislikesCount,
        myStatus: filledComments[0].likesInfo.myStatus,
      },
    };
  }

  async findCommentsByPostId(
    queryPagination: PaginationDto,
    postId: string,
    currentUserDto: CurrentUserDto | null,
  ) {
    const post = await this.postsService.checkPostInDB(postId);
    if (!post || post.banInfo.isBanned || post.postOwnerInfo.isBanned)
      throw new NotFoundException();
    const searchFilters = [];
    searchFilters.push({ 'postInfo.id': postId });
    searchFilters.push({ 'commentatorInfo.isBanned': false });
    searchFilters.push({ 'banInfo.isBanned': false });
    const field = queryPagination.sortBy;
    const pagination = await this.pagination.convert(queryPagination, field);
    const comments = await this.commentsRepository.findCommentsByPostId(
      pagination,
      searchFilters,
    );
    if (!comments) {
      return {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };
    }
    const filledComments = await this.commandBus.execute(
      new FillingCommentsDataCommand(comments, currentUserDto),
    );
    const totalCount = await this.commentsRepository.countDocuments(
      searchFilters,
    );
    const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryPagination.pageNumber,
      pageSize: queryPagination.pageSize,
      totalCount: totalCount,
      items: filledComments,
    };
  }
}
