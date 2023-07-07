import * as uuid4 from 'uuid4';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CreateBloggerBlogsDto } from '../../dto/create-blogger-blogs.dto';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BloggerBlogsRawSqlRepository } from '../../infrastructure/blogger-blogs-raw-sql.repository';
import { BloggerBlogsRawSqlEntity } from '../../entities/blogger-blogs-raw-sql.entity';

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
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}
  async execute(command: CreateBloggerBlogCommand) {
    const blogsEntity: BloggerBlogsRawSqlEntity = {
      ...command.createBloggerBlogsDto,
      id: uuid4().toString(),
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerId: command.currentUser.id,
      blogOwnerLogin: command.currentUser.login,
      blogOwnerBanStatus: command.currentUser.isBanned,
      banInfoBanStatus: false,
      banInfoBanDate: null,
      banInfoBanReason: null,
    };
    const ability = this.caslAbilityFactory.createForUser(command.currentUser);
    try {
      ForbiddenError.from(ability).throwUnlessCan(
        Action.CREATE,
        command.currentUser,
      );
      const newBlog = await this.bloggerBlogsRawSqlRepository.createBlogs(
        blogsEntity,
      );
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
      throw new InternalServerErrorException(error.message);
    }
  }
}
