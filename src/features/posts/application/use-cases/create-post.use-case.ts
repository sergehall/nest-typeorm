import { CreatePostDto } from '../../dto/create-post.dto';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OwnerInfoDto } from '../../dto/ownerInfo.dto';
import * as uuid4 from 'uuid4';
import { StatusLike } from '../../../../infrastructure/database/enums/like-status.enums';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsEntity } from '../../entities/posts.entity';

export class CreatePostCommand {
  constructor(
    public createPostDto: CreatePostDto,
    public ownerInfoDto: OwnerInfoDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepository: PostsRepository,
  ) {}
  async execute(command: CreatePostCommand) {
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(
        command.createPostDto.blogId,
      );
    if (!blog) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogs({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.CREATE, {
        id: blog.blogOwnerInfo.userId,
      });
      const newPost: PostsEntity = {
        id: uuid4().toString(),
        title: command.createPostDto.title,
        shortDescription: command.createPostDto.shortDescription,
        content: command.createPostDto.content,
        blogId: command.createPostDto.blogId,
        blogName: blog.name,
        createdAt: new Date().toISOString(),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: StatusLike.NONE,
          newestLikes: [],
        },
        postOwnerInfo: {
          userId: command.ownerInfoDto.userId,
          userLogin: command.ownerInfoDto.userLogin,
          isBanned: false,
        },
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      };
      const result = await this.postsRepository.createPost(newPost);
      return {
        id: result.id,
        title: result.title,
        shortDescription: result.shortDescription,
        content: result.content,
        blogId: result.blogId,
        blogName: result.blogName,
        createdAt: result.createdAt,
        extendedLikesInfo: {
          likesCount: result.extendedLikesInfo.likesCount,
          dislikesCount: result.extendedLikesInfo.dislikesCount,
          myStatus: result.extendedLikesInfo.myStatus,
          newestLikes: result.extendedLikesInfo.newestLikes,
        },
      };
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
