import { ParseQueriesDto } from '../../../../common/query/dto/parse-queries.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepo } from '../../infrastructure/posts-repo';
import { PostsAndCountDto } from '../../dto/posts-and-count.dto';
import { PostWithLikesInfoViewModel } from '../../views/post-with-likes-info.view-model';
import { ImagesPostsPathKeyBufferDto } from '../../dto/images-posts-path-key-buffer.dto';
import { ImagesPostsOriginalMetadataRepo } from '../../infrastructure/images-posts-original-metadata.repo';
import { PostsService } from '../posts.service';
import { PostWithLikesImagesInfoViewModel } from '../../views/post-with-likes-images-info.view-model';
import { PostImagesViewModel } from '../../views/post-images.view-model';

export class GetPostsInBlogCommand {
  constructor(
    public blogId: string,
    public queryData: ParseQueriesDto,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(GetPostsInBlogCommand)
export class GetPostsInBlogUseCase
  implements ICommandHandler<GetPostsInBlogCommand>
{
  constructor(
    private readonly postsRepo: PostsRepo,
    private readonly postsService: PostsService,
    private readonly imagesPostsOriginalMetadataRepo: ImagesPostsOriginalMetadataRepo,
  ) {}

  async execute(command: GetPostsInBlogCommand) {
    const { blogId, queryData, currentUserDto } = command;
    const { pageNumber, pageSize } = queryData.queryPagination;

    // Retrieve posts and their count
    const postsAndNumberOfPosts: PostsAndCountDto =
      await this.postsRepo.getPostsInBlogWithPagination(
        blogId,
        queryData,
        currentUserDto,
      );
    const totalCount = postsAndNumberOfPosts.countPosts;

    // If no posts found, return empty result
    if (totalCount === 0) {
      return {
        pagesCount: pageNumber,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: pageNumber - 1,
        items: postsAndNumberOfPosts.posts,
      };
    }

    // Extract posts and their IDs
    const posts: PostWithLikesInfoViewModel[] = postsAndNumberOfPosts.posts;
    const postIds = posts.map((post) => post.id);

    // Retrieve metadata for images associated with posts
    const pathsKeysBufferDto: {
      [postId: string]: ImagesPostsPathKeyBufferDto[];
    }[] =
      await this.imagesPostsOriginalMetadataRepo.findAllImagesPostMetadataMany(
        postIds,
        posts[0].blogId,
      );

    // Map posts to their respective view models with image metadata
    const postWithLikesImages: PostWithLikesImagesInfoViewModel[] =
      await this.mapToPostsWithLikesImagesInfoViewModel(
        posts,
        pathsKeysBufferDto,
      );
    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: postWithLikesImages,
    };
  }

  private async mapToPostsWithLikesImagesInfoViewModel(
    posts: PostWithLikesInfoViewModel[],
    imagesMetadata: { [postId: string]: ImagesPostsPathKeyBufferDto[] }[],
  ): Promise<PostWithLikesImagesInfoViewModel[]> {
    // Map posts to promises of their respective view models with image metadata
    const resultPromises = posts.map(
      async (post: PostWithLikesInfoViewModel) => {
        const postId = post.id;
        const images: ImagesPostsPathKeyBufferDto[] =
          imagesMetadata.find((entry) => entry[postId])?.[postId] || [];

        // Retrieve metadata for images
        const metadataPromise: PostImagesViewModel =
          await this.postsService.imagesMetadataProcessor(images);
        return { post, metadataPromise };
      },
    );

    // Wait for all promises to resolve
    const results = await Promise.all(resultPromises);

    // Map results to post view models with image metadata
    return Promise.all(
      results.map(async ({ post, metadataPromise }) => {
        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: post.extendedLikesInfo,
          images: {
            main: metadataPromise.main,
          },
        };
      }),
    );
  }
}
