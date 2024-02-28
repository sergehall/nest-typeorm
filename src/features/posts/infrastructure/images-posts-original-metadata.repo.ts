import { KeyResolver } from '../../../common/helpers/key-resolver';
import { InjectRepository } from '@nestjs/typeorm';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { EntityManager, Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { PostsEntity } from '../entities/posts.entity';
import { InternalServerErrorException } from '@nestjs/common';
import {
  UrlPathKeyEtagDto,
  UrlsPathKeysEtagsDto,
} from '../../blogger-blogs/dto/url-pathKey-etag.dto';
import { FileUploadDto } from '../../blogger-blogs/dto/file-upload.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { ImagesPostsOriginalMetadataEntity } from '../entities/images-post-original-metadata.entity';
import { ImagesPostsMiddleMetadataEntity } from '../entities/images-posts-middle-metadata.entity';
import { ImagesPostsSmallMetadataEntity } from '../entities/images-posts-small-metadata.entity';
import { ResizedImageDetailsDto } from '../dto/resized-image-details.dto';
import { OriginalMiddleSmallEntitiesDto } from '../dto/original-middle-small-entities.dto';
import { ImagesPostsSmallMetadataRepo } from './images-posts-small-metadata.repo';
import { ImagesPostsMiddleMetadataRepo } from './images-posts-middle-metadata.repo';
import { PathKeyBufferDto } from '../dto/path-key-buffer.dto';

export class ImagesPostsOriginalMetadataRepo {
  constructor(
    @InjectRepository(ImagesPostsOriginalMetadataEntity)
    protected imagesPostsOriginalMetadataRepository: Repository<ImagesPostsOriginalMetadataEntity>,
    protected imagesPostsMiddleMetadataRepo: ImagesPostsMiddleMetadataRepo,
    protected imagesPostsSmallMetadataRepo: ImagesPostsSmallMetadataRepo,
    protected uuidErrorResolver: UuidErrorResolver,
    protected keyResolver: KeyResolver,
  ) {}

  async createImagePostOriginalMiddleSmallSizes(
    blog: BloggerBlogsEntity,
    post: PostsEntity,
    resizedImages: ResizedImageDetailsDto,
    urlsPathKeysEtagsDto: UrlsPathKeysEtagsDto,
    currentUserDto: CurrentUserDto,
  ): Promise<OriginalMiddleSmallEntitiesDto> {
    try {
      const [originalMetadata, middleMetadata, smallMetadata] =
        await Promise.all([
          this.createImagePostOriginalMetadata(
            blog,
            post,
            resizedImages.original,
            urlsPathKeysEtagsDto.original,
            currentUserDto,
          ),
          this.imagesPostsMiddleMetadataRepo.createImagePostMiddleMetadata(
            blog,
            post,
            resizedImages.middle,
            urlsPathKeysEtagsDto.middle,
            currentUserDto,
          ),
          this.imagesPostsSmallMetadataRepo.createImagePostSmallMetadata(
            blog,
            post,
            resizedImages.small,
            urlsPathKeysEtagsDto.small,
            currentUserDto,
          ),
        ]);

      return {
        original: originalMetadata,
        middle: middleMetadata,
        small: smallMetadata,
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating or updating the post image file metadata.',
      );
    }
  }

  async createImagePostOriginalMetadata(
    blog: BloggerBlogsEntity,
    post: PostsEntity,
    fileUploadDto: FileUploadDto,
    urlPathKeyEtagDto: UrlPathKeyEtagDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ImagesPostsOriginalMetadataEntity> {
    const bannedFlags = await this.getBannedFlags();
    let postsImagesFileMetadataEntity: ImagesPostsOriginalMetadataEntity;

    const queryBuilder = this.imagesPostsOriginalMetadataRepository
      .createQueryBuilder('image') // Start building a query
      .leftJoinAndSelect('image.blog', 'blog')
      .leftJoinAndSelect('image.post', 'post')
      .where('blog.id = :blogId', { blogId: blog.id })
      .andWhere('post.id = :postId', { postId: post.id })
      .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
      .andWhere({ isBanned: bannedFlags.isBanned });

    // Check if entity already exists
    const existingEntity: ImagesPostsOriginalMetadataEntity | null =
      await queryBuilder.getOne();

    // If entity exists, update it; otherwise, create a new one
    if (existingEntity) {
      existingEntity.pathKey = urlPathKeyEtagDto.pathKey;
      existingEntity.eTag = urlPathKeyEtagDto.eTag;
      existingEntity.originalName = fileUploadDto.originalname;
      existingEntity.encoding = fileUploadDto.encoding;
      existingEntity.mimetype = fileUploadDto.mimetype;
      existingEntity.buffer = fileUploadDto.buffer;
      existingEntity.size = fileUploadDto.size;
      existingEntity.createdAt = new Date().toISOString();
      postsImagesFileMetadataEntity = existingEntity;
    } else {
      postsImagesFileMetadataEntity =
        ImagesPostsOriginalMetadataEntity.createPostsImagesFileMetadataEntity(
          blog,
          post,
          fileUploadDto,
          urlPathKeyEtagDto,
          currentUserDto,
        );
    }

    try {
      return await this.imagesPostsOriginalMetadataRepository.save(
        postsImagesFileMetadataEntity,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating or updating the post image file metadata.',
      );
    }
  }

  async findAndMergeImagesMetadataForPosts(
    postIds: string[],
    blogId: string,
  ): Promise<{ [postId: string]: PathKeyBufferDto[] }[]> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    // Wrap the database queries within a transaction
    return this.imagesPostsOriginalMetadataRepository.manager.transaction(
      async (transactionManager) => {
        // Parallelize the retrieval of metadata for different sizes of files
        const [
          originalMetadataPromise,
          middleMetadataPromise,
          smallMetadataPromise,
        ] = await Promise.all([
          this.findImagesPostOriginalMetadataMany(
            postIds,
            blogId,
            dependencyIsBanned,
            isBanned,
            transactionManager,
          ),
          this.findImagesPostMiddleMetadataMany(
            postIds,
            blogId,
            dependencyIsBanned,
            isBanned,
            transactionManager,
          ),
          this.findImagesPostSmallMetadataMany(
            postIds,
            blogId,
            dependencyIsBanned,
            isBanned,
            transactionManager,
          ),
        ]);

        // Merge the results into a single array
        const mergedMetadata: {
          [postId: string]: PathKeyBufferDto[];
        }[] = [];

        originalMetadataPromise.forEach((original, index) => {
          const merged: { [postId: string]: PathKeyBufferDto[] } = {};
          Object.keys(original).forEach((postId) => {
            merged[postId] = [
              original[postId],
              middleMetadataPromise[index][postId],
              smallMetadataPromise[index][postId],
            ];
          });
          mergedMetadata.push(merged);
        });

        return mergedMetadata;
      },
    );
  }

  // async findAllImagesPostMetadataMany(
  //   postIds: string[],
  //   blogId: string,
  // ): Promise<{ [postId: string]: ImagesPostsPathKeyBufferDto[] }[]> {
  //   const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
  //   const { dependencyIsBanned, isBanned } = bannedFlags;
  //
  //   return this.imagesPostsOriginalMetadataRepository.manager.transaction(
  //     async (manager) => {
  //       const originalMetadataPromise: {
  //         [postId: string]: ImagesPostsPathKeyBufferDto;
  //       }[] = await this.findImagesPostOriginalMetadataMany(
  //         postIds,
  //         blogId,
  //         dependencyIsBanned,
  //         isBanned,
  //         manager,
  //       );
  //
  //       const middleMetadataPromise: {
  //         [postId: string]: ImagesPostsPathKeyBufferDto;
  //       }[] = await this.findImagesPostMiddleMetadataMany(
  //         postIds,
  //         blogId,
  //         dependencyIsBanned,
  //         isBanned,
  //         manager,
  //       );
  //
  //       const smallMetadataPromise: {
  //         [postId: string]: ImagesPostsPathKeyBufferDto;
  //       }[] = await this.findImagesPostSmallMetadataMany(
  //         postIds,
  //         blogId,
  //         dependencyIsBanned,
  //         isBanned,
  //         manager,
  //       );
  //
  //       const [
  //         originalMetadataResults,
  //         middleMetadataResults,
  //         smallMetadataResults,
  //       ] = await Promise.all([
  //         originalMetadataPromise,
  //         middleMetadataPromise,
  //         smallMetadataPromise,
  //       ]);
  //
  //       const mergeMetadata = (
  //         originalMetadataResults: {
  //           [postId: string]: ImagesPostsPathKeyBufferDto;
  //         }[],
  //         middleMetadataResults: {
  //           [postId: string]: ImagesPostsPathKeyBufferDto;
  //         }[],
  //         smallMetadataResults: {
  //           [postId: string]: ImagesPostsPathKeyBufferDto;
  //         }[],
  //       ): { [postId: string]: ImagesPostsPathKeyBufferDto[] }[] => {
  //         const mergedMetadata: {
  //           [postId: string]: ImagesPostsPathKeyBufferDto[];
  //         }[] = [];
  //
  //         originalMetadataResults.forEach((original, index) => {
  //           const merged: { [postId: string]: ImagesPostsPathKeyBufferDto[] } =
  //             {};
  //           Object.keys(original).forEach((postId) => {
  //             merged[postId] = [
  //               original[postId],
  //               middleMetadataResults[index][postId],
  //               smallMetadataResults[index][postId],
  //             ];
  //           });
  //           mergedMetadata.push(merged);
  //         });
  //
  //         return mergedMetadata;
  //       };
  //
  //       return mergeMetadata(
  //         originalMetadataResults,
  //         middleMetadataResults,
  //         smallMetadataResults,
  //       );
  //     },
  //   );
  // }

  private async findImagesPostOriginalMetadataMany(
    postIds: string[],
    blogId: string,
    dependencyIsBanned: boolean,
    isBanned: boolean,
    manager: EntityManager,
  ): Promise<{ [postId: string]: PathKeyBufferDto }[]> {
    const queryBuilder = manager
      .createQueryBuilder(ImagesPostsOriginalMetadataEntity, 'imagesPostsMain')
      .leftJoinAndSelect('imagesPostsMain.post', 'post')
      .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .andWhere('post.id IN (:...postIds)', { postIds })
      .andWhere('blog.id = :blogId', { blogId });

    try {
      const originalMetadata: ImagesPostsOriginalMetadataEntity[] =
        await queryBuilder.getMany();

      return await this.mapEntitiesToDTOs(originalMetadata);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  private async findImagesPostMiddleMetadataMany(
    postIds: string[],
    blogId: string,
    dependencyIsBanned: boolean,
    isBanned: boolean,
    manager: EntityManager,
  ): Promise<{ [postId: string]: PathKeyBufferDto }[]> {
    const queryBuilder = manager
      .createQueryBuilder(ImagesPostsMiddleMetadataEntity, 'imagesPostsMain')
      .leftJoinAndSelect('imagesPostsMain.post', 'post')
      .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .andWhere('post.id IN (:...postIds)', { postIds })
      .andWhere('blog.id = :blogId', { blogId });

    try {
      const middleMetadata = await queryBuilder.getMany();

      return await this.mapEntitiesToDTOs(middleMetadata);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  private async findImagesPostSmallMetadataMany(
    postIds: string[],
    blogId: string,
    dependencyIsBanned: boolean,
    isBanned: boolean,
    manager: EntityManager,
  ): Promise<{ [postId: string]: PathKeyBufferDto }[]> {
    const queryBuilder = manager
      .createQueryBuilder(ImagesPostsSmallMetadataEntity, 'imagesPostsMain')
      .leftJoinAndSelect('imagesPostsMain.post', 'post')
      .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .andWhere('post.id IN (:...postIds)', { postIds })
      .andWhere('blog.id = :blogId', { blogId });

    try {
      const smallMetadata: ImagesPostsSmallMetadataEntity[] =
        await queryBuilder.getMany();
      return await this.mapEntitiesToDTOs(smallMetadata);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  private async mapEntitiesToDTOs(
    entities: (
      | ImagesPostsOriginalMetadataEntity
      | ImagesPostsMiddleMetadataEntity
      | ImagesPostsSmallMetadataEntity
    )[],
  ): Promise<{ [postId: string]: PathKeyBufferDto }[]> {
    const result: { [postId: string]: PathKeyBufferDto }[] = [];

    if (entities.length === 0) {
      return result;
    }

    return entities.map((entity) => ({
      [entity.post.id]: {
        pathKey: entity.pathKey,
        buffer: entity.buffer,
      },
    }));
  }

  private async getBannedFlags(): Promise<BannedFlagsDto> {
    return {
      commentatorInfoIsBanned: false,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
  }

  private async getSortByField(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
      sortBy,
      [
        'title',
        'shortDescription',
        'content',
        'blogName',
        'dependencyIsBanned',
        'isBanned',
        'banDate',
        'banReason',
      ],
      'createdAt',
    );
  }
}
