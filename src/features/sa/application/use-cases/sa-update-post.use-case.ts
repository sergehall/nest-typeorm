import { ForbiddenException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { UpdatePostDto } from '../../../posts/dto/update-post.dto';
import { PostsRepo } from '../../../posts/infrastructure/posts-repo';
import { SaBlogIdPostIdParams } from '../../../../common/query/params/sa-blog-id-post-id.params';

export class SaUpdatePostsByPostIdCommand {
  constructor(
    public params: SaBlogIdPostIdParams,
    public updatePostDto: UpdatePostDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaUpdatePostsByPostIdCommand)
export class SaUpdatePostsByPostIdUseCase
  implements ICommandHandler<SaUpdatePostsByPostIdCommand>
{
  constructor(
    protected postsRepo: PostsRepo,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async execute(command: SaUpdatePostsByPostIdCommand): Promise<boolean> {
    const { params, updatePostDto, currentUserDto } = command;
    const { postId } = params;

    await this.checkSaPermission(currentUserDto);

    return await this.postsRepo.updatePostByPostId(postId, updatePostDto);
  }

  private async checkSaPermission(currentUser: CurrentUserDto): Promise<void> {
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
