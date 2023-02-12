import { BloggerBlogsOwnerDto } from '../../dto/blogger-blogs-owner.dto';
import * as uuid4 from 'uuid4';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';
import { BloggerBlogsRepository } from '../../infrastructure/blogger-blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBloggerBlogCommand {
  constructor(public blogsOwnerDto: BloggerBlogsOwnerDto) {}
}

@CommandHandler(CreateBloggerBlogCommand)
export class CreateBloggerBlogUseCase
  implements ICommandHandler<CreateBloggerBlogCommand>
{
  constructor(protected bloggerBlogsRepository: BloggerBlogsRepository) {}
  async execute(command: CreateBloggerBlogCommand) {
    const blogsEntity = {
      ...command.blogsOwnerDto,
      id: uuid4().toString(),
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    const newBlog: BloggerBlogsEntity =
      await this.bloggerBlogsRepository.createBlogs(blogsEntity);
    return {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
    };
  }
}
