import * as uuid4 from 'uuid4';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';
import { BloggerBlogsRepository } from '../../infrastructure/blogger-blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CreateBloggerBlogsDto } from '../../dto/create-blogger-blogs.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class CreateBloggerBlogCommand {
  constructor(
    public createBloggerBlogsDto: CreateBloggerBlogsDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(CreateBloggerBlogCommand)
export class CreateBloggerBlogUseCase
  implements ICommandHandler<CreateBloggerBlogCommand>
{
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async execute(command: CreateBloggerBlogCommand) {
    const blogsEntity: BloggerBlogsEntity = {
      ...command.createBloggerBlogsDto,
      id: uuid4().toString(),
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerInfo: {
        userId: command.currentUser.id,
        userLogin: command.currentUser.login,
        isBanned: command.currentUser.isBanned,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
    const ability = this.caslAbilityFactory.createForUser(command.currentUser);
    try {
      ForbiddenError.from(ability).throwUnlessCan(
        Action.CREATE,
        command.currentUser,
      );
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
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}
