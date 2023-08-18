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
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { CreatePostDto } from '../../dto/create-post.dto';
import { TablesPostsEntity } from '../../entities/tables-posts-entity';
import { BannedUsersForBlogsRawSqlRepository } from '../../../users/infrastructure/banned-users-for-blogs-raw-sql.repository';
import { userNotHavePermissionForPost } from '../../../../common/filters/custom-errors-messages';
import { ExtendedLikesInfo, PostsViewDto } from '../../view-dto/posts-view.dto';
import { ReturnPostsEntityDto } from '../../dto/return-posts-entity.dto';

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
  async execute(command: CreatePostCommand): Promise<PostsViewDto> {
    const { blogId, currentUserDto, createPostDto } = command;

    const blog: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRawSqlRepository.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.checkUserPermission(blog, currentUserDto);

    // User has the permission, proceed with creating the post
    const tablesPostEntity: TablesPostsEntity = await this.getTablesPostsEntity(
      blog,
      createPostDto,
      currentUserDto,
    );

    const newPost = await this.postsRawSqlRepository.createPost(
      tablesPostEntity,
    );

    // addExtendedLikesInfoToPosts and return the new post view
    return await this.addExtendedLikesInfoToPosts(newPost);
  }

  private async getTablesPostsEntity(
    blog: TableBloggerBlogsRawSqlEntity,
    createPostDto: CreatePostDto,
    currentUserDto: CurrentUserDto,
  ): Promise<TablesPostsEntity> {
    return {
      id: uuid4().toString(),
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      postOwnerId: currentUserDto.id,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      banInfoBanDate: null,
      banInfoBanReason: null,
    };
  }

  private async addExtendedLikesInfoToPosts(
    newPost: ReturnPostsEntityDto,
  ): Promise<PostsViewDto> {
    const extendedLikesInfo = new ExtendedLikesInfo();
    return {
      ...newPost, // Spread properties of newPost
      extendedLikesInfo, // Add extendedLikesInfo property
    };
  }

  private async checkUserPermission(
    blog: TableBloggerBlogsRawSqlEntity,
    currentUserDto: CurrentUserDto,
  ) {
    // Check if the user is banned from posting in this blog
    const userIsBannedForBlog =
      await this.bannedUsersForBlogsRawSqlRepository.userIsBanned(
        currentUserDto.id,
        blog.id,
      );

    // Check if the user has the permission to create a post in this blog
    const ability = this.caslAbilityFactory.createForUserId({
      id: currentUserDto.id,
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
