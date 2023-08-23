import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { CreatePostDto } from '../../dto/create-post.dto';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { userNotHavePermissionForPost } from '../../../../common/filters/custom-errors-messages';
import { ReturnPostsEntity } from '../../entities/return-posts.entity';

export class CreatePostCommand {
  constructor(
    public blogId: string,
    public createPostDto: CreatePostDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly postsRawSqlRepository: PostsRawSqlRepository,
    private readonly bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    private readonly bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
  ) {}
  async execute(command: CreatePostCommand): Promise<ReturnPostsEntity> {
    const { blogId, currentUserDto, createPostDto } = command;

    const blog: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.checkUserPermission(blog, currentUserDto);

    return await this.postsRawSqlRepository.createPost(
      blog,
      createPostDto,
      currentUserDto,
    );
  }

  private async checkUserPermission(
    blog: TableBloggerBlogsRawSqlEntity,
    currentUserDto: CurrentUserDto,
  ) {
    // Check if the user is banned from posting in this blog
    const userIsBannedForBlog =
      await this.bannedUsersForBlogsRawSqlRepository.userIsBanned(
        currentUserDto.userId,
        blog.id,
      );

    // Check if the user has the permission to create a post in this blog
    const ability = this.caslAbilityFactory.createForUserId({
      id: currentUserDto.userId,
    });

    // User is banned from posting in this blog, throw a ForbiddenException with a custom error message
    if (userIsBannedForBlog)
      throw new ForbiddenException(userNotHavePermissionForPost);

    try {
      // Check the user's ability to create a post in this blog
      ForbiddenError.from(ability).throwUnlessCan(Action.CREATE, {
        id: blog.blogOwnerId,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'Leaving post for this user is not allowed. ' + error.message,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
