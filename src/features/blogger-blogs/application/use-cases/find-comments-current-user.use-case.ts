import { PaginationDto } from '../../../common/pagination/dto/pagination.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { ConvertFiltersForDB } from '../../../common/convert-filters/convertFiltersForDB';
import { QueryArrType } from '../../../common/convert-filters/types/convert-filter.types';
import { Pagination } from '../../../common/pagination/pagination';

export class FindCommentsCurrentUserCommand {
  constructor(
    public queryPagination: PaginationDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(FindCommentsCurrentUserCommand)
export class FindCommentsCurrentUserUseCase
  implements ICommandHandler<FindCommentsCurrentUserCommand>
{
  constructor(
    protected commentsRepository: CommentsRepository,
    protected convertFiltersForDB: ConvertFiltersForDB,
    protected pagination: Pagination,
  ) {}
  async execute(command: FindCommentsCurrentUserCommand) {
    const field = command.queryPagination.sortBy;
    const searchFilters: QueryArrType = [];
    searchFilters.push({ 'postInfo.blogOwnerId': command.currentUser.id });
    searchFilters.push({ 'commentatorInfo.isBanned': false });
    searchFilters.push({ 'banInfo.isBanned': false });
    const pagination = await this.pagination.convert(
      command.queryPagination,
      field,
    );
    const comments = await this.commentsRepository.findCommentsByBlogOwnerId(
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
    const totalCount = await this.commentsRepository.countDocuments(
      searchFilters,
    );
    const pagesCount = Math.ceil(totalCount / command.queryPagination.pageSize);

    const pageNumber = command.queryPagination.pageNumber;
    const pageSize = pagination.pageSize;
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: comments,
    };
  }
}
