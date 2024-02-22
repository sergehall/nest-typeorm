import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { NotFoundException } from '@nestjs/common';
import { PostWithLikesInfoViewModel } from '../../views/post-with-likes-info.view-model';
import { ImagesPostsOriginalMetadataRepo } from '../../infrastructure/images-posts-original-metadata.repo';
import { PostsService } from '../posts.service';
import { PostWithLikesImagesInfoViewModel } from '../../views/post-with-likes-images-info.view-model';
import { PathKeyBufferDto } from '../../dto/path-key-buffer.dto';

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

    const postWithLikesArr: PostWithLikesInfoViewModel[] | null =
      await this.postsRepo.getPostByIdWithLikes(postId, currentUserDto);

    if (!postWithLikesArr || postWithLikesArr.length === 0)
      throw new NotFoundException(`Post with ID ${postId} not found`);

    const post: PostWithLikesInfoViewModel = postWithLikesArr[0];

    const pathKeyBufferArr: {
      [postId: string]: PathKeyBufferDto[];
    }[] =
      await this.postsImagesFileMetadataRepo.findAndMergeImagesMetadataForPosts(
        [post.id],
        post.blogId,
      );

    const postWithLikesImages: PostWithLikesImagesInfoViewModel[] =
      await this.postsService.mapPostsWithLikesAndImagesMetadata(
        [post],
        pathKeyBufferArr,
      );

    return postWithLikesImages[0];
  }
}
