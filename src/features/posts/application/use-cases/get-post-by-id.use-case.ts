import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { NotFoundException } from '@nestjs/common';
import { PostWithLikesInfoViewModel } from '../../views/post-with-likes-info.view-model';
import { ImagesPostsOriginalMetadataRepo } from '../../infrastructure/images-posts-original-metadata.repo';
import { PostsService } from '../posts.service';
import { PostWithLikesImagesInfoViewModel } from '../../views/post-with-likes-images-info.view-model';
import { PostImagesViewModel } from '../../views/post-images.view-model';
import { ImagesPostsPathKeyBufferDto } from '../../dto/images-posts-path-key-buffer.dto';

export class GetPostByIdCommand {
  constructor(
    public postId: string,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly postsService: PostsService,
    private readonly postsImagesFileMetadataRepo: ImagesPostsOriginalMetadataRepo,
  ) {}
  async execute(
    command: GetPostByIdCommand,
  ): Promise<PostWithLikesImagesInfoViewModel> {
    const { postId, currentUserDto } = command;

    const post: PostWithLikesInfoViewModel[] | null =
      await this.postsRepo.getPostByIdWithLikes(postId, currentUserDto);

    if (!post || post.length === 0)
      throw new NotFoundException(`Post with ID ${postId} not found`);

    const pathKeyBufferDto: ImagesPostsPathKeyBufferDto[] =
      await this.postsImagesFileMetadataRepo.findAllImagesPostMetadata(
        post[0].id,
        post[0].blogId,
      );

    const imagesMetadata: PostImagesViewModel =
      await this.postsService.imagesMetadataProcessor(pathKeyBufferDto);

    return {
      ...post[0],
      images: imagesMetadata,
    };
  }
}
