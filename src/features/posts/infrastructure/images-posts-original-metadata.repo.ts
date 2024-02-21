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
import { ImagesPostsPathKeyBufferDto } from '../dto/images-posts-path-key-buffer.dto';
import { ImagesPostsSmallMetadataRepo } from './images-posts-small-metadata.repo';
import { ImagesPostsMiddleMetadataRepo } from './images-posts-middle-metadata.repo';

export class ImagesPostsOriginalMetadataRepo {
  constructor(
    @InjectRepository(ImagesPostsOriginalMetadataEntity)
    protected imagesPostsOriginalMetadataRepository: Repository<ImagesPostsOriginalMetadataEntity>,
    protected imagesPostsMiddleMetadataRepo: ImagesPostsMiddleMetadataRepo,
    protected imagesPostsSmallMetadataRepo: ImagesPostsSmallMetadataRepo,
    protected uuidErrorResolver: UuidErrorResolver,
    protected keyResolver: KeyResolver,
  ) {}

  async findImagesPostOriginalMetadata1(
    postId: string,
    blogId: string,
  ): Promise<ImagesPostsOriginalMetadataEntity[]> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    // Query posts and countPosts with pagination conditions
    const queryBuilder = this.imagesPostsOriginalMetadataRepository
      .createQueryBuilder('imagesPostsMain')
      .leftJoinAndSelect('imagesPostsMain.post', 'post')
      .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .andWhere('post.id = :postId', { postId })
      .andWhere('blog.id = :blogId', { blogId });

    return await queryBuilder.getMany();
  }

  async findAllImagesPostMetadata(
    postId: string,
    blogId: string,
  ): Promise<ImagesPostsPathKeyBufferDto[]> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    return this.imagesPostsOriginalMetadataRepository.manager.transaction(
      async (manager) => {
        const promises = [
          this.findImagesPostOriginalMetadata(
            postId,
            blogId,
            dependencyIsBanned,
            isBanned,
            manager,
          ),
          this.findImagesPostMiddleMetadata(
            postId,
            blogId,
            dependencyIsBanned,
            isBanned,
            manager,
          ),
          this.findImagesPostSmallMetadata(
            postId,
            blogId,
            dependencyIsBanned,
            isBanned,
            manager,
          ),
        ];

        const results = await Promise.all(promises);
        const filteredResults = results.filter(
          (result): result is ImagesPostsPathKeyBufferDto => result !== null,
        );

        if (filteredResults.length === 0) {
          throw new InternalServerErrorException('No metadata found');
        }

        return filteredResults;
      },
    );
  }

  private async findImagesPostOriginalMetadata(
    postId: string,
    blogId: string,
    dependencyIsBanned: boolean,
    isBanned: boolean,
    manager: EntityManager,
  ): Promise<ImagesPostsPathKeyBufferDto | null> {
    const queryBuilder = manager
      .createQueryBuilder(ImagesPostsOriginalMetadataEntity, 'imagesPostsMain')
      .leftJoinAndSelect('imagesPostsMain.post', 'post')
      .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .andWhere('post.id = :postId', { postId })
      .andWhere('blog.id = :blogId', { blogId });

    try {
      const originalMetadata = await queryBuilder.getOne();
      return originalMetadata
        ? this.convertEntityToDTO(originalMetadata)
        : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async findImagesPostMiddleMetadata(
    postId: string,
    blogId: string,
    dependencyIsBanned: boolean,
    isBanned: boolean,
    manager: EntityManager,
  ): Promise<ImagesPostsPathKeyBufferDto | null> {
    const queryBuilder = manager
      .createQueryBuilder(ImagesPostsMiddleMetadataEntity, 'imagesPostsMain')
      .leftJoinAndSelect('imagesPostsMain.post', 'post')
      .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .andWhere('post.id = :postId', { postId })
      .andWhere('blog.id = :blogId', { blogId });

    try {
      const middleMetadata = await queryBuilder.getOne();
      return middleMetadata ? this.convertEntityToDTO(middleMetadata) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async findImagesPostSmallMetadata(
    postId: string,
    blogId: string,
    dependencyIsBanned: boolean,
    isBanned: boolean,
    manager: EntityManager,
  ): Promise<ImagesPostsPathKeyBufferDto | null> {
    const queryBuilder = manager
      .createQueryBuilder(ImagesPostsSmallMetadataEntity, 'imagesPostsMain')
      .leftJoinAndSelect('imagesPostsMain.post', 'post')
      .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
      .where({ dependencyIsBanned })
      .andWhere({ isBanned })
      .andWhere('post.id = :postId', { postId })
      .andWhere('blog.id = :blogId', { blogId });

    try {
      const smallMetadata = await queryBuilder.getOne();
      return smallMetadata ? this.convertEntityToDTO(smallMetadata) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private convertEntityToDTO(
    entity: ImagesPostsOriginalMetadataEntity,
  ): ImagesPostsPathKeyBufferDto {
    return {
      pathKey: entity.pathKey,
      buffer: entity.buffer,
    };
  }

  // async findImagesPostOriginalMetadata(
  //   postId: string,
  //   blogId: string,
  // ): Promise<ImagesPostsOriginalMetadataEntity | null> {
  //   const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
  //   const { dependencyIsBanned, isBanned } = bannedFlags;
  //
  //   // Query posts and countPosts with pagination conditions
  //   const queryBuilder = this.imagesPostsOriginalMetadataRepository
  //     .createQueryBuilder('imagesPostsMain')
  //     .leftJoinAndSelect('imagesPostsMain.post', 'post')
  //     .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
  //     .where({ dependencyIsBanned })
  //     .andWhere({ isBanned })
  //     .andWhere('post.id = :postId', { postId })
  //     .andWhere('blog.id = :blogId', { blogId });
  //
  //   try {
  //     const originalMetadata = await queryBuilder.getOne();
  //     return originalMetadata ? originalMetadata : null;
  //   } catch (error) {
  //     if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
  //       const blogId = await this.uuidErrorResolver.extractUserIdFromError(
  //         error,
  //       );
  //       throw new NotFoundException(
  //         `OriginalMetadata with ID ${blogId} not found`,
  //       );
  //     }
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async findImagesPostMiddleMetadata(
  //   postId: string,
  //   blogId: string,
  // ): Promise<ImagesPostsMiddleMetadataEntity | null> {
  //   const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
  //   const { dependencyIsBanned, isBanned } = bannedFlags;
  //
  //   // Query posts and countPosts with pagination conditions
  //   const queryBuilder = this.imagesPostMiddleMetadataRepository
  //     .createQueryBuilder('imagesPostsMain')
  //     .leftJoinAndSelect('imagesPostsMain.post', 'post')
  //     .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
  //     .where({ dependencyIsBanned })
  //     .andWhere({ isBanned })
  //     .andWhere('post.id = :postId', { postId })
  //     .andWhere('blog.id = :blogId', { blogId });
  //
  //   try {
  //     const middleMetadata = await queryBuilder.getOne();
  //     return middleMetadata ? middleMetadata : null;
  //   } catch (error) {
  //     if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
  //       const blogId = await this.uuidErrorResolver.extractUserIdFromError(
  //         error,
  //       );
  //       throw new NotFoundException(
  //         `OriginalMetadata with ID ${blogId} not found`,
  //       );
  //     }
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async findImagesPostSmallMetadata(
  //   postId: string,
  //   blogId: string,
  // ): Promise<ImagesPostsSmallMetadataEntity | null> {
  //   const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
  //   const { dependencyIsBanned, isBanned } = bannedFlags;
  //
  //   // Query posts and countPosts with pagination conditions
  //   const queryBuilder = this.imagesPostSmallMetadataRepository
  //     .createQueryBuilder('imagesPostsMain')
  //     .leftJoinAndSelect('imagesPostsMain.post', 'post')
  //     .leftJoinAndSelect('imagesPostsMain.blog', 'blog')
  //     .where({ dependencyIsBanned })
  //     .andWhere({ isBanned })
  //     .andWhere('post.id = :postId', { postId })
  //     .andWhere('blog.id = :blogId', { blogId });
  //
  //   try {
  //     const middleMetadata = await queryBuilder.getOne();
  //     return middleMetadata ? middleMetadata : null;
  //   } catch (error) {
  //     if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
  //       const blogId = await this.uuidErrorResolver.extractUserIdFromError(
  //         error,
  //       );
  //       throw new NotFoundException(
  //         `OriginalMetadata with ID ${blogId} not found`,
  //       );
  //     }
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async createImagePostMetadata(
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

  // async createImagePostMiddleMetadata(
  //   blog: BloggerBlogsEntity,
  //   post: PostsEntity,
  //   fileUploadDto: FileUploadDto,
  //   urlPathKeyEtagDto: UrlPathKeyEtagDto,
  //   currentUserDto: CurrentUserDto,
  // ): Promise<ImagesPostsMiddleMetadataEntity> {
  //   const bannedFlags = await this.getBannedFlags();
  //   let postsImagesFileMetadataEntity: ImagesPostsMiddleMetadataEntity;
  //
  //   const queryBuilder = this.imagesPostMiddleMetadataRepository
  //     .createQueryBuilder('image') // Start building a query
  //     .leftJoinAndSelect('image.blog', 'blog')
  //     .leftJoinAndSelect('image.post', 'post')
  //     .where('blog.id = :blogId', { blogId: blog.id })
  //     .andWhere('post.id = :postId', { postId: post.id })
  //     .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
  //     .andWhere({ isBanned: bannedFlags.isBanned });
  //
  //   // Check if entity already exists
  //   const existingEntity: ImagesPostsMiddleMetadataEntity | null =
  //     await queryBuilder.getOne();
  //
  //   // If entity exists, update it; otherwise, create a new one
  //   if (existingEntity) {
  //     existingEntity.pathKey = urlPathKeyEtagDto.pathKey;
  //     existingEntity.eTag = urlPathKeyEtagDto.eTag;
  //     existingEntity.originalName = fileUploadDto.originalname;
  //     existingEntity.encoding = fileUploadDto.encoding;
  //     existingEntity.mimetype = fileUploadDto.mimetype;
  //     existingEntity.buffer = fileUploadDto.buffer;
  //     existingEntity.size = fileUploadDto.size;
  //     existingEntity.createdAt = new Date().toISOString();
  //     postsImagesFileMetadataEntity = existingEntity;
  //   } else {
  //     postsImagesFileMetadataEntity =
  //       ImagesPostsMiddleMetadataEntity.createPostsImagesMiddleMetadataEntity(
  //         blog,
  //         post,
  //         fileUploadDto,
  //         urlPathKeyEtagDto,
  //         currentUserDto,
  //       );
  //   }
  //
  //   try {
  //     return await this.imagesPostMiddleMetadataRepository.save(
  //       postsImagesFileMetadataEntity,
  //     );
  //   } catch (error) {
  //     console.log(error.message);
  //     throw new InternalServerErrorException(
  //       'An error occurred while creating or updating the post image file metadata.',
  //     );
  //   }
  // }

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
