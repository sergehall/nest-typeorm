import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { ParseQueriesType } from '../../../common/query/types/parse-query.types';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ReturnPostsEntity } from '../../entities/return-posts-entity.entity';

export class FindPostByIdCommand {
  constructor(
    public postId: string,
    public queryData: ParseQueriesType,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(FindPostByIdCommand)
export class FindPostByIdUseCase
  implements ICommandHandler<FindPostByIdCommand>
{
  constructor(
    private readonly postsRawSqlRepository: PostsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: FindPostByIdCommand): Promise<ReturnPostsEntity> {
    const { postId, queryData, currentUserDto } = command;
    return await this.postsRawSqlRepository.findPostByPostId(
      postId,
      queryData,
      currentUserDto,
    );
  }
}