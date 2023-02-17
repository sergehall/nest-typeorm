import { PaginationDto } from '../../../common/pagination/dto/pagination.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { FilteringCommentsNoBannedUserCommand } from '../../../users/application/use-cases/filtering-comments-noBannedUser.use-case';
import { CommentsEntity } from '../../../comments/entities/comments.entity';
import { FillingCommentsDataCommand } from '../../../comments/application/use-cases/filling-comments-data.use-case';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';

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
  constructor(protected commentsRepository: CommentsRepository) {}
  async execute(command: FindCommentsCurrentUserCommand) {
    const comments = await this.commentsRepository.findCommentsByBlogOwnerId(
      command.currentUser.id,
    );
    if (!comments || comments.length === 0) {
      return {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };
    }
    console.log(comments);
    // const commentsNotBannedUser = await this.commandBus.execute(
    //   new FilteringCommentsNoBannedUserCommand(comments),
    // );
    // let desc = 1;
    // let asc = -1;
    // const field: 'content' | 'createdAt' =
    //   queryPagination.sortBy === 'content'
    //     ? queryPagination.sortBy
    //     : 'createdAt';
    // if (
    //   queryPagination.sortDirection === 'asc' ||
    //   queryPagination.sortDirection === 'ascending' ||
    //   queryPagination.sortDirection === 1
    // ) {
    //   desc = -1;
    //   asc = 1;
    // }
    // const totalCount = commentsNotBannedUser.length;
    // const allComments = commentsNotBannedUser.sort(
    //   await byField(field, asc, desc),
    // );
    //
    // async function byField(
    //   field: 'content' | 'createdAt',
    //   asc: number,
    //   desc: number,
    // ) {
    //   return (a: CommentsEntity, b: CommentsEntity) =>
    //     a[field] > b[field] ? asc : desc;
    // }
    //
    // const startIndex =
    //   (queryPagination.pageNumber - 1) * queryPagination.pageSize;
    // const pagesCount = Math.ceil(totalCount / queryPagination.pageSize);
    //
    // const commentsSlice = allComments.slice(
    //   startIndex,
    //   startIndex + queryPagination.pageSize,
    // );
    // const filledComments = await this.commandBus.execute(
    //   new FillingCommentsDataCommand(commentsSlice, currentUser),
    // );
    //
    // return {
    //   pagesCount: pagesCount,
    //   page: queryPagination.pageNumber,
    //   pageSize: queryPagination.pageSize,
    //   totalCount: totalCount,
    //   items: filledComments,
    // };
    return true;
  }
}
