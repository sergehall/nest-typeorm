import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { NotFoundException } from '@nestjs/common';
import { PostWithLikesInfoViewModel } from '../../views/post-with-likes-info.view-model';

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
  async execute(
    command: GetPostByIdCommand,
  ): Promise<PostWithLikesInfoViewModel> {
    const { postId, currentUserDto } = command;

    const post: PostWithLikesInfoViewModel[] | null =
      await this.postsRepo.getPostByIdWithLikes(postId, currentUserDto);

    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    return post[0];
  }
}
