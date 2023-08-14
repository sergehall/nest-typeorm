import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ReturnPostsEntity } from '../../entities/return-posts-entity.entity';
import { NotFoundException } from '@nestjs/common';
import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';

export class FindPostByIdCommand {
  constructor(
    public postId: string,
    public queryData: ParseQueriesDto,
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
  async execute(
    command: FindPostByIdCommand,
  ): Promise<ReturnPostsEntity | null> {
    const { postId, queryData, currentUserDto } = command;
    const post: ReturnPostsEntity | null =
      await this.postsRawSqlRepository.findPostByPostIdWithLikes(
        postId,
        queryData,
        currentUserDto,
      );

    if (!post) throw new NotFoundException('Not found post.');

    return post;
  }
}
