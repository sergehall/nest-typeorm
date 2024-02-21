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
import {
  PostImages,
  PostImagesViewModel,
} from '../../views/post-images.view-model';

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

    const postsAndNumberOfPosts: PostsAndCountDto =
      await this.postsRepo.getPostsInBlogWithPagination(
        blogId,
        queryData,
        currentUserDto,
      );

    const totalCount = postsAndNumberOfPosts.countPosts;

    if (postsAndNumberOfPosts.countPosts === 0) {
      return {
        pagesCount: pageNumber,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: pageNumber - 1,
        items: postsAndNumberOfPosts.posts,
      };
    }
    const posts: PostWithLikesInfoViewModel[] = postsAndNumberOfPosts.posts;

    const postIds = posts.map((post) => post.id);

    const pathsKeysBufferDto: {
      [postId: string]: ImagesPostsPathKeyBufferDto[];
    }[] =
      await this.imagesPostsOriginalMetadataRepo.findAllImagesPostMetadataMany(
        postIds,
        posts[0].blogId,
      );

    async function mapToPostWithLikesImagesInfoViewModel(
      posts: PostWithLikesInfoViewModel[],
      imagesMetadata: { [postId: string]: ImagesPostsPathKeyBufferDto[] }[],
      postsService: PostsService,
    ): Promise<PostWithLikesImagesInfoViewModel[]> {
      const resultPromises = posts.map(async (post) => {
        const postId = post.id;
        const images =
          imagesMetadata.find((entry) => entry[postId])?.[postId] || [];
        const metadata: PostImagesViewModel =
          await postsService.imagesMetadataProcessor(images); // Use the variable

        const postWithImages: PostWithLikesImagesInfoViewModel = {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: post.extendedLikesInfo,
          images: {
            main: metadata.main,
          },
        };
        return postWithImages;
      });

      return Promise.all(resultPromises);
    }

    const postsArr = await mapToPostWithLikesImagesInfoViewModel(
      posts,
      pathsKeysBufferDto,
      this.postsService,
    );

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: postsArr,
    };
  }
}
