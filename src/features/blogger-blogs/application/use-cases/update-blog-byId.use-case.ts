import { UpdateBBlogsDto } from '../../dto/update-blogger-blogs.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../../entities/table-blogger-blogs-raw-sql.entity';

export class UpdateBlogByIdCommand {
  constructor(
    public id: string,
    public updateBlogDto: UpdateBBlogsDto,
    public currentUser: CurrentUserDto,
  ) {}
}
@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdUseCase
  implements ICommandHandler<UpdateBlogByIdCommand>
{
  constructor(
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async execute(command: UpdateBlogByIdCommand): Promise<boolean> {
    const blogToUpdate = await this.bloggerBlogsRawSqlRepository.findBlogById(
      command.id,
    );
    if (!blogToUpdate) {
      throw new NotFoundException('Blog not found');
    }

    await this.checkUpdatePermission(blogToUpdate, command.currentUser);

    const updatedBlog: TableBloggerBlogsRawSqlEntity = {
      ...blogToUpdate,
      ...command.updateBlogDto,
    };

    return await this.bloggerBlogsRawSqlRepository.updatedBlogById(updatedBlog);
  }

  private async checkUpdatePermission(
    blogToUpdate: TableBloggerBlogsRawSqlEntity,
    currentUser: CurrentUserDto,
  ): Promise<void> {
    const ability = this.caslAbilityFactory.createForUserId({
      id: blogToUpdate.blogOwnerId,
    });

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUser.id,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to update this blog. ' + error.message,
      );
    }
  }
}
