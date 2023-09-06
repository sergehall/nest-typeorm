import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ReturnBloggerBlogsDto } from '../../../blogger-blogs/entities/return-blogger-blogs.entity';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';

export class SaGetBlogByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(SaGetBlogByIdCommand)
export class SaGetBlogByIdUseCase
  implements ICommandHandler<SaGetBlogByIdCommand>
{
  constructor(
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: SaGetBlogByIdCommand): Promise<ReturnBloggerBlogsDto> {
    const { id } = command;

    const blog = await this.bloggerBlogsRepo.findBlogById(id);

    if (!blog) {
      throw new NotFoundException(`Blog with id: ${id} not found`);
    }

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
