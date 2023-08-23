import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IdDto } from '../../../../ability/dto/id.dto';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../../entities/table-blogger-blogs-raw-sql.entity';

export class DeleteBlogByBlogIdCommand {
  constructor(public blogId: string, public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(DeleteBlogByBlogIdCommand)
export class DeleteBlogByBlogIdUseCase
  implements ICommandHandler<DeleteBlogByBlogIdCommand>
{
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly bloggerBlogsRepository: BloggerBlogsRawSqlRepository,
  ) {}
  async execute(command: DeleteBlogByBlogIdCommand): Promise<boolean> {
    const { blogId, currentUserDto } = command;

    const blogToRemove: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRepository.findBlogById(blogId);
    if (!blogToRemove) throw new NotFoundException('Not found blog.');

    await this.checkUserPermission(currentUserDto, blogToRemove.blogOwnerId);

    return await this.bloggerBlogsRepository.deleteBlogByBlogId(blogId);
  }

  private async checkUserPermission(
    currentUserDto: CurrentUserDto,
    blogOwnerId: string,
  ) {
    const userIdDto: IdDto = { id: currentUserDto.userId };
    const ability = this.caslAbilityFactory.createForUserId(userIdDto);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: blogOwnerId,
      });
    } catch (error) {
      throw new ForbiddenException(
        'You are not allowed to remove this blog. ' + error.message,
      );
    }
  }
}
