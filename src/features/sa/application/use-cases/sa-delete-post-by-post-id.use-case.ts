import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRawSqlRepository } from '../../../posts/infrastructure/posts-raw-sql.repository';
import { SaBlogIdPostIdParams } from '../../../../common/query/params/sa-blog-id-post-id.params';

export class SaDeletePostByPostIdCommand {
  constructor(
    public params: SaBlogIdPostIdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaDeletePostByPostIdCommand)
export class SaDeletePostByPostIdUseCase
  implements ICommandHandler<SaDeletePostByPostIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly postsRepository: PostsRawSqlRepository,
  ) {}
  async execute(command: SaDeletePostByPostIdCommand): Promise<boolean> {
    const { params, currentUserDto } = command;
    const { postId } = params;

    await this.checkSaPermission(currentUserDto);

    return await this.postsRepository.deletePostByPostId(postId);
  }

  private async checkSaPermission(currentUser: CurrentUserDto): Promise<void> {
    const ability = this.caslAbilityFactory.createSaUser(currentUser);

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUser.userId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to delete this post. ' + error.message,
      );
    }
  }
}
