import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CreatePostDto } from '../../dto/create-post.dto';
import { userNotHavePermissionForPost } from '../../../../common/filters/custom-errors-messages';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { PostViewModel } from '../../views/post.view-model';
import { BannedUsersForBlogsRepo } from '../../../users/infrastructure/banned-users-for-blogs.repo';
import { PostsService } from '../posts.service';
import { PostWithLikesInfoViewModel } from '../../views/post-with-likes-info.view-model';
import { PostWithLikesImagesInfoViewModel } from '../../views/post-with-likes-images-info.view-model';
import { SendNewBlogPostNotificationsCommand } from '../../../telegram/application/use-cases/send-new-blog-post-notifications.use-case';
import { FilesMetadataService } from '../../../../adapters/media-services/files/files-metadata.service';

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
    private readonly commandBus: CommandBus,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly postsRepo: PostsRepo,
    private readonly postsService: PostsService,
    private readonly imagesMetadataService: FilesMetadataService,
    private readonly bloggerBlogsRepo: BloggerBlogsRepo,
    private readonly bannedUsersForBlogsRepo: BannedUsersForBlogsRepo,
  ) {}
  async execute(
    command: CreatePostCommand,
  ): Promise<PostWithLikesImagesInfoViewModel> {
    const { blogId, currentUserDto, createPostDto } = command;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    await this.checkUserPermission(blog, currentUserDto);

    const post: PostViewModel = await this.postsRepo.createPost(
      blog,
      createPostDto,
      currentUserDto,
    );

    await this.commandBus.execute(
      new SendNewBlogPostNotificationsCommand(blog, post),
    );

    const postWithLikes: PostWithLikesInfoViewModel =
      await this.postsService.addExtendedLikesInfoToPostsEntity(post);

    return await this.imagesMetadataService.addImagesToPostModel(postWithLikes);
  }

  private async checkUserPermission(
    blog: BloggerBlogsEntity,
    currentUserDto: CurrentUserDto,
  ) {
    // Check if the user is banned from posting in this blog
    const userIsBannedForBlog = await this.bannedUsersForBlogsRepo.userIsBanned(
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
