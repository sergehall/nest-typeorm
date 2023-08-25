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
import { CreatePostDto } from '../../dto/create-post.dto';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { userNotHavePermissionForPost } from '../../../../common/filters/custom-errors-messages';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
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
    private readonly postsRepo: PostsRepo,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
    private readonly bannedUsersForBlogsRawSqlRepository: BannedUsersForBlogsRawSqlRepository,
  ) {}
  async execute(command: CreatePostCommand): Promise<ReturnPostsEntity> {
    const { blogId, currentUserDto, createPostDto } = command;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.checkUserPermission(blog, currentUserDto);

    return await this.postsRepo.createPosts(
      blog,
      createPostDto,
      currentUserDto,
    );
  }

  private async checkUserPermission(
    blog: BloggerBlogsEntity,
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
        id: blog.blogOwner.userId,
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
