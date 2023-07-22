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
import { BlogIdParams } from '../../../common/params/blogId.params';
import { CreatePostDto } from '../../dto/create-post.dto';

export class CreatePostCommand {
  constructor(
    public params: BlogIdParams,
    public createPostDto: CreatePostDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly postsRawSqlRepository: PostsRawSqlRepository,
  ) {}
  async execute(command: CreatePostCommand) {
    const blog: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRawSqlRepository.findBlogById(
        command.params.blogId,
      );
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Check if the user is banned from posting in this blog
    const isUserBanned =
      await this.bloggerBlogsRawSqlRepository.isBannedUserForBlog(
        command.currentUserDto.id,
        command.params.blogId,
      );
    if (isUserBanned)
      // User is banned from posting in this blog, throw a ForbiddenException with a custom error message
      throw new ForbiddenException('You are banned from posting in this blog');

    // Check if the user has the permission to create a post in this blog
    const ability = this.caslAbilityFactory.createForUserId({
      id: command.currentUserDto.id,
    });
    try {
      // Check the user's ability to create a post in this blog
      ForbiddenError.from(ability).throwUnlessCan(Action.CREATE, {
        id: blog.blogOwnerId,
      });
      // User has the permission, proceed with creating the post
      const newPost: PostsRawSqlEntity = {
        id: uuid4().toString(),
        title: command.createPostDto.title,
        shortDescription: command.createPostDto.shortDescription,
        content: command.createPostDto.content,
        blogId: command.params.blogId,
        blogName: blog.name,
        createdAt: new Date().toISOString(),
        postOwnerId: command.currentUserDto.id,
        postOwnerLogin: command.currentUserDto.login,
        postOwnerIsBanned: false,
        banInfoIsBanned: false,
        banInfoBanDate: null,
        banInfoBanReason: null,
      };
      // Create and return the new post
      const createdNewPost: PostsRawSqlEntity =
        await this.postsRawSqlRepository.createPost(newPost);
      return {
        id: createdNewPost.id,
        title: createdNewPost.title,
        shortDescription: createdNewPost.shortDescription,
        content: createdNewPost.content,
        blogId: createdNewPost.blogId,
        blogName: createdNewPost.blogName,
        createdAt: createdNewPost.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You do not have permission to create a post for this blog.',
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
