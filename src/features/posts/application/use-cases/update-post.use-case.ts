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
import { BlogIdPostIdParams } from '../../../common/params/blogId-postId.params';
import { UpdateDataPostDto } from '../../dto/update-data-post.dto';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';
import { PostsRawSqlEntity } from '../../entities/posts-raw-sql.entity';

export class UpdatePostCommand {
  constructor(
    public updateDataPostDto: UpdateDataPostDto,
    public params: BlogIdPostIdParams,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected postsRawSqlRepository: PostsRawSqlRepository,
  ) {}

  async execute(command: UpdatePostCommand) {
    const blog: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRawSqlRepository.findBlogById(
        command.params.blogId,
      );

    if (!blog) {
      throw new NotFoundException('Not found blog.');
    }

    const post: PostsRawSqlEntity | null =
      await this.postsRawSqlRepository.findPostByPostId(command.params.postId);

    if (!post) {
      throw new NotFoundException('Not found post');
    }

    this.checkUserAuthorization(blog, command.currentUserDto);

    return await this.postsRawSqlRepository.updatePost(
      command.params.postId,
      command.updateDataPostDto,
    );
  }

  private checkUserAuthorization(
    blog: TableBloggerBlogsRawSqlEntity,
    currentUserDto: CurrentUserDto,
  ) {
    const ability = this.caslAbilityFactory.createForUserId({
      id: blog.blogOwnerId,
    });

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUserDto.id,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
