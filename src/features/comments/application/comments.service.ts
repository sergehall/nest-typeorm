import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { Pagination } from '../../common/pagination/pagination';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { PostsService } from '../../posts/application/posts.service';
import { CommandBus } from '@nestjs/cqrs';
import { FillingCommentsDataCommand } from './use-cases/filling-comments-data.use-case';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';

@Injectable()
export class CommentsService {
  constructor(
    protected pagination: Pagination,
    protected commentsRepository: CommentsRepository,
    protected postsService: PostsService,
    protected commandBus: CommandBus,
  ) {}

  async findCommentById(
    commentId: string,
    currentUserDto: CurrentUserDto | null,
  ) {
    const comment = await this.commentsRepository.findCommentById(commentId);
    if (!comment) throw new NotFoundException();
    const filledComments = await this.commandBus.execute(
      new FillingCommentsDataCommand([comment], currentUserDto),
    );
    return filledComments[0];
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
