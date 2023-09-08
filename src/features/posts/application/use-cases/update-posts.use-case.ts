import { ForbiddenException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BlogIdPostIdParams } from '../../../../common/query/params/blogId-postId.params';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostsRepo } from '../../infrastructure/posts-repo';

export class UpdatePostsByPostIdCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public updatePostDto: UpdatePostDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(UpdatePostsByPostIdCommand)
export class UpdatePostsByPostIdUseCase
  implements ICommandHandler<UpdatePostsByPostIdCommand>
{
  constructor(
    protected postsRepo: PostsRepo,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async execute(command: UpdatePostsByPostIdCommand): Promise<boolean> {
    const { params, updatePostDto, currentUserDto } = command;
    const { postId } = params;

    await this.checkUpdatePermission(currentUserDto);

    return await this.postsRepo.updatePostByPostId(postId, updatePostDto);
  }

  private async checkUpdatePermission(
    currentUser: CurrentUserDto,
  ): Promise<void> {
    const ability = this.caslAbilityFactory.createSaUser(currentUser);

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUser.userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to update this post. ' + error.message,
      );
    }
  }
}
