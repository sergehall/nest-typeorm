import { CreatePostDto } from '../../dto/create-post.dto';
import { CurrentUserDto } from '../../../auth/dto/currentUser.dto';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../ability/roles/action.enum';
import { CreatePostAndNameDto } from '../../dto/create-post-and-name.dto';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../ability/casl-ability.factory';
import { PostsService } from '../posts.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostCommand {
  constructor(
    public createPostDto: CreatePostDto,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsService: PostsService,
  ) {}
  async execute(command: CreatePostCommand) {
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(
        command.createPostDto.blogId,
      );
    if (!blog) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.CREATE, {
        id: command.currentUser.id,
      });
      const createPost: CreatePostAndNameDto = {
        title: command.createPostDto.title,
        shortDescription: command.createPostDto.shortDescription,
        content: command.createPostDto.content,
        blogId: blog.id,
        name: blog.name,
      };
      const blogOwnerInfo = {
        userId: blog.blogOwnerInfo.userId,
        userLogin: blog.blogOwnerInfo.userLogin,
        isBanned: blog.blogOwnerInfo.isBanned,
      };
      return await this.postsService.createPost(createPost, blogOwnerInfo);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
