import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { IdParams } from '../../../../common/query/params/id.params';
import { PostsRepo } from '../../infrastructure/posts-repo';

export class DeletePostByIdCommand {
  constructor(
    public params: IdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase
  implements ICommandHandler<DeletePostByIdCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepo: PostsRepo,
  ) {}
  async execute(command: DeletePostByIdCommand): Promise<boolean> {
    const { params, currentUserDto } = command;
    const { id } = params;

    const postToDelete = await this.postsRepo.getPostByIdWithoutLikes(id);
    if (!postToDelete) {
      throw new NotFoundException(`Post with id: ${id} not found.`);
    }

    const ability = this.caslAbilityFactory.createForUserId({
      id: currentUserDto.userId,
    });
    try {
      // ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
      //   id: postToDelete.postOwnerId,
      // });
      // The old conditions, then it was not necessary to check the owner post
      ForbiddenError.from(ability).throwUnlessCan(Action.DELETE, {
        id: currentUserDto.userId,
      });
      return await this.postsRepo.deletePostByPostId(id);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
