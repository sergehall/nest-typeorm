import { UpdateBBlogsDto } from '../../dto/update-blogger-blogs.dto';
import { CurrentUserDto } from '../../../auth/dto/currentUser.dto';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../ability/roles/action.enum';
import { BloggerBlogsRepository } from '../../infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async execute(command: UpdateBlogByIdCommand) {
    const blogToUpdate: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(command.id);
    if (!blogToUpdate) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blogToUpdate.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: command.currentUser.id,
      });
      const blogEntity: BloggerBlogsEntity = {
        id: blogToUpdate.id,
        name: command.updateBlogDto.name,
        description: command.updateBlogDto.description,
        websiteUrl: command.updateBlogDto.websiteUrl,
        createdAt: blogToUpdate.createdAt,
        blogOwnerInfo: {
          userId: blogToUpdate.blogOwnerInfo.userId,
          userLogin: blogToUpdate.blogOwnerInfo.userLogin,
          isBanned: blogToUpdate.blogOwnerInfo.isBanned,
        },
      };
      return await this.bloggerBlogsRepository.updatedBlogById(blogEntity);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
