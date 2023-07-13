import { CreatePostDto } from '../../dto/create-post.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as uuid4 from 'uuid4';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { PostsRawSqlEntity } from '../../entities/posts-raw-sql.entity';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';

export class CreatePostCommand {
  constructor(
    public createPostDto: CreatePostDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRawSqlRepository: PostsRawSqlRepository,
  ) {}
  async execute(command: CreatePostCommand) {
    const blog: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRawSqlRepository.openFindBlogById(
        command.createPostDto.blogId,
      );
    if (!blog) throw new NotFoundException();
    const verifyUserForBlog =
      await this.bloggerBlogsRawSqlRepository.isBannedUserForBlog(
        command.currentUserDto.id,
        command.createPostDto.blogId,
      );
    if (verifyUserForBlog) throw new ForbiddenException();
    const ability = this.caslAbilityFactory.createForUserId({
      id: command.currentUserDto.id,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.CREATE, {
        id: blog.blogOwnerId,
      });
      const newPost: PostsRawSqlEntity = {
        id: uuid4().toString(),
        title: command.createPostDto.title,
        shortDescription: command.createPostDto.shortDescription,
        content: command.createPostDto.content,
        blogId: command.createPostDto.blogId,
        blogName: blog.name,
        createdAt: new Date().toISOString(),
        postOwnerId: command.currentUserDto.id,
        postOwnerLogin: command.currentUserDto.login,
        postOwnerIsBanned: false,
        banInfoBanStatus: false,
        banInfoBanDate: null,
        banInfoBanReason: null,
      };
      const result: PostsRawSqlEntity =
        await this.postsRawSqlRepository.createPost(newPost);
      return {
        id: result.id,
        title: result.title,
        shortDescription: result.shortDescription,
        content: result.content,
        blogId: result.blogId,
        blogName: result.blogName,
        createdAt: result.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
