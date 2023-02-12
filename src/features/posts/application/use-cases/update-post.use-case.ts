import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { BloggerBlogsRepository } from '../../../blogger-blogs/infrastructure/blogger-blogs.repository';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OwnerInfoDto } from '../../dto/ownerInfo.dto';
import { UpdatePostPlusIdDto } from '../../dto/update-post-plusId.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    public updatePostPlusIdDto: UpdatePostPlusIdDto,
    public ownerInfoDto: OwnerInfoDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected bloggerBlogsRepository: BloggerBlogsRepository,
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepository: PostsRepository,
  ) {}
  async execute(command: UpdatePostCommand) {
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepository.findBlogById(
        command.updatePostPlusIdDto.blogId,
      );
    if (!blog) throw new NotFoundException();
    const ability = this.caslAbilityFactory.createForBBlogger({
      id: blog.blogOwnerInfo.userId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: command.ownerInfoDto.userId,
      });
      return await this.postsRepository.updatePost(command.updatePostPlusIdDto);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
    }
  }
}
