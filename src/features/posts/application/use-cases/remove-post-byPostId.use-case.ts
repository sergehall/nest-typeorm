import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogIdPostIdParams } from '../../../common/params/blogId-postId.params';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { BloggerBlogsRawSqlRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { PostsRawSqlEntity } from '../../entities/posts-raw-sql.entity';
import { PostsRawSqlRepository } from '../../infrastructure/posts-raw-sql.repository';

export class RemovePostByPostIdCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public currentUser: CurrentUserDto,
  ) {}
}

@CommandHandler(RemovePostByPostIdCommand)
export class RemovePostByPostIdUseCase
  implements ICommandHandler<RemovePostByPostIdCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
    protected postsRawSqlRepository: PostsRawSqlRepository,
  ) {}
  async execute(command: RemovePostByPostIdCommand): Promise<boolean> {
    const blogToDelete: TableBloggerBlogsRawSqlEntity | null =
      await this.bloggerBlogsRawSqlRepository.findBlogById(
        command.params.blogId,
      );

    if (!blogToDelete) {
      throw new NotFoundException('Not found blog.');
    }

    const post: PostsRawSqlEntity | null =
      await this.postsRawSqlRepository.findPostByPostId(command.params.postId);

    if (!post) {
      throw new NotFoundException('Not found post');
    }

    this.checkUserAuthorization(blogToDelete, command.currentUser);
    return await this.postsRawSqlRepository.removePostByPostId(
      command.params.postId,
    );
  }
  private checkUserAuthorization(
    blogToDelete: TableBloggerBlogsRawSqlEntity,
    currentUserDto: CurrentUserDto,
  ) {
    const ability = this.caslAbilityFactory.createForUserId({
      id: blogToDelete.blogOwnerId,
    });

    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUserDto.id,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You do not have permission to delete a post. ' + error.message,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
