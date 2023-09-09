import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { NotFoundException } from '@nestjs/common';
import { ReturnPostsEntity } from '../../entities/return-posts.entity';

export class GetPostByIdCommand {
  constructor(
    public postId: string,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly postsRepo: PostsRepo,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: GetPostByIdCommand): Promise<ReturnPostsEntity> {
    const { postId, currentUserDto } = command;

    const post: ReturnPostsEntity[] | null =
      await this.postsRepo.getPostByIdWithLikes(postId, currentUserDto);

    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    return post[0];
  }
}
