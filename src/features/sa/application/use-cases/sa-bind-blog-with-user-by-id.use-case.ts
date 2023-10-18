import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { IdUserIdParams } from '../../../../common/query/params/id-userId.params';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { UsersEntity } from '../../../users/entities/users.entity';
import { UsersRepo } from '../../../users/infrastructure/users-repo';

export class SaBindBlogWithUserByIdCommand {
  constructor(
    public params: IdUserIdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SaBindBlogWithUserByIdCommand)
export class SaBindBlogWithUserByIdUseCase
  implements ICommandHandler<SaBindBlogWithUserByIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRepo: UsersRepo,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
  ) {}
  async execute(command: SaBindBlogWithUserByIdCommand): Promise<boolean> {
    const { id, userId } = command.params;
    const { currentUserDto } = command;

    const blogForBind: BloggerBlogsEntity = await this.getBlogForBind(id);

    const userForBind: UsersEntity = await this.getUserForBind(userId);

    await this.checkUserPermission(currentUserDto, userId);

    return await this.bloggerBlogsRepo.saBindBlogWithUser(
      userForBind,
      blogForBind,
    );
  }

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    userForBindUserId: string,
  ) {
    const ability = this.caslAbilityFactory.createSaUser(currentUserDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: userForBindUserId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to bind this blog and user. ' + error.message,
      );
    }
  }

  private async getUserForBind(userId: string): Promise<UsersEntity> {
    const userForBind: UsersEntity | null =
      await this.usersRepo.findUserByUserId(userId);
    if (!userForBind) {
      throw new NotFoundException('Not found user.');
    }
    return userForBind;
  }

  private async getBlogForBind(blogId: string): Promise<BloggerBlogsEntity> {
    const blogForBind: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findNotBannedBlogById(blogId);
    if (!blogForBind) {
      throw new NotFoundException('Not found blog.');
    }
    return blogForBind;
  }
}
