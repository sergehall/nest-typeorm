import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { NotFoundException } from '@nestjs/common';
import { ReturnBloggerBlogsEntity } from '../../../blogger-blogs/entities/return-blogger-blogs.entity';

export class GetBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  async execute(
    command: GetBlogByIdCommand,
  ): Promise<ReturnBloggerBlogsEntity> {
    const { blogId } = command;

    const blog = await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id: ${blogId} not found`);
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
