import { PaginationDto } from '../../../common/pagination/dto/pagination.dto';
import { QueryArrType } from '../../../common/convert-filters/types/convert-filter.types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class FindCommentsCurrentUserCommand {
  constructor(
    public queryPagination: PaginationDto,
    public searchFilters: QueryArrType,
  ) {}
}

@CommandHandler(FindCommentsCurrentUserCommand)
export class FindCommentsCurrentUserUseCase
  implements ICommandHandler<FindCommentsCurrentUserCommand>
{
  async execute(command: FindCommentsCurrentUserCommand) {
    return command;
  }
}
