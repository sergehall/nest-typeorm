import { KeyResolver } from '../../../common/helpers/key-resolver';
import { InjectRepository } from '@nestjs/typeorm';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { PostsEntity } from '../entities/posts.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UrlEtagDto } from '../../blogger-blogs/dto/url-etag.dto';
import { FileUploadDtoDto } from '../../blogger-blogs/dto/file-upload.dto';
import { ImagesBlogsWallpaperMetadataEntity } from '../../blogger-blogs/entities/images-blog-wallpaper-metadata.entity';
import { ImagesBlogsMainMetadataEntity } from '../../blogger-blogs/entities/images-blog-main-metadata.entity';
import { ImagesPostsMetadataEntity } from '../entities/images-post-metadata.entity';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';

export class ImagesPostsMetadataRepo {
  constructor(
    @InjectRepository(ImagesPostsMetadataEntity)
    protected imagesPostsFileMetadataRepository: Repository<ImagesPostsMetadataEntity>,
    @InjectRepository(ImagesBlogsWallpaperMetadataEntity)
    protected imagesBlogsWallpaperFileMetadataRepository: Repository<ImagesBlogsWallpaperMetadataEntity>,
    @InjectRepository(ImagesBlogsMainMetadataEntity)
    protected imagesBlogsMainMetadataRepository: Repository<ImagesBlogsMainMetadataEntity>,
    protected keyResolver: KeyResolver,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async findImagesBlogsWallpaperById(
    blogId: string,
  ): Promise<ImagesBlogsWallpaperMetadataEntity | null> {
    const isBanned = false;
    const dependencyIsBanned = false;
    const queryBuilder = this.imagesBlogsWallpaperFileMetadataRepository
      .createQueryBuilder('blogsWallpaper') // Start building a query
      .leftJoinAndSelect('blogsWallpaper.blogOwner', 'blogOwner') // Eager load the blogOwner relationship
      .where('blogsWallpaper.blogId = :blogId', { blogId })
      .andWhere({ isBanned })
      .andWhere({ dependencyIsBanned });

    try {
      const blogsWallpaper = await queryBuilder.getOne(); // Execute the query and get a single result

      return blogsWallpaper || null; // Return the retrieved blog with its associated blogOwner
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(
          `Blog Wallpaper with ID ${userId} not found`,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findImagesBlogsMainById(
    blogId: string,
  ): Promise<ImagesBlogsMainMetadataEntity | null> {
    const isBanned = false;
    const dependencyIsBanned = false;
    const queryBuilder = this.imagesBlogsMainMetadataRepository
      .createQueryBuilder('blogsMain') // Start building a query
      .leftJoinAndSelect('blogsMain.blogOwner', 'blogOwner') // Eager load the blogOwner relationship
      .where('blogsMain.blogId = :blogId', { blogId })
      .andWhere({ isBanned })
      .andWhere({ dependencyIsBanned });

    try {
      const blogsMain = await queryBuilder.getOne(); // Execute the query and get a single result

      return blogsMain || null; // Return the retrieved blog with its associated blogOwner
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId = await this.uuidErrorResolver.extractUserIdFromError(
          error,
        );
        throw new NotFoundException(
          `Blog Wallpaper with ID ${userId} not found`,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createImagesPostsMetadata(
    blog: BloggerBlogsEntity,
    post: PostsEntity,
    fileUploadDto: FileUploadDtoDto,
    urlEtagDto: UrlEtagDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ImagesPostsMetadataEntity> {
    const bannedFlags = await this.getBannedFlags();
    let postsImagesFileMetadataEntity: ImagesPostsMetadataEntity;

    const queryBuilder = this.imagesPostsFileMetadataRepository
      .createQueryBuilder('image') // Start building a query
      .leftJoinAndSelect('image.blog', 'blog')
      .leftJoinAndSelect('image.post', 'post')
      .where('blog.id = :blogId', { blogId: blog.id })
      .andWhere('post.id = :postId', { postId: post.id })
      .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
      .andWhere({ isBanned: bannedFlags.isBanned });

    // Check if entity already exists
    const existingEntity: ImagesPostsMetadataEntity | null =
      await queryBuilder.getOne();

    // If entity exists, update it; otherwise, create a new one
    if (existingEntity) {
      existingEntity.url = urlEtagDto.url;
      existingEntity.eTag = urlEtagDto.eTag;
      existingEntity.originalName = fileUploadDto.originalname;
      existingEntity.encoding = fileUploadDto.encoding;
      existingEntity.mimetype = fileUploadDto.mimetype;
      existingEntity.buffer = fileUploadDto.buffer;
      existingEntity.size = fileUploadDto.size;
      existingEntity.createdAt = new Date().toISOString();
      postsImagesFileMetadataEntity = existingEntity;
    } else {
      postsImagesFileMetadataEntity =
        ImagesPostsMetadataEntity.createPostsImagesFileMetadataEntity(
          blog,
          post,
          fileUploadDto,
          urlEtagDto,
          currentUserDto,
        );
    }

    try {
      return await this.imagesPostsFileMetadataRepository.save(
        postsImagesFileMetadataEntity,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating or updating the post image file metadata.',
      );
    }
  }

  async createImagesBlogWallpaper(
    blog: BloggerBlogsEntity,
    fileUploadDto: FileUploadDtoDto,
    urlEtagDto: UrlEtagDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ImagesBlogsWallpaperMetadataEntity> {
    const bannedFlags = await this.getBannedFlags();
    let imagesBlogWallpaperFileMetadataEntity: ImagesBlogsWallpaperMetadataEntity;

    const queryBuilder = this.imagesBlogsWallpaperFileMetadataRepository
      .createQueryBuilder('image') // Start building a query
      .leftJoinAndSelect('image.blog', 'blog')
      .where('blog.id = :blogId', { blogId: blog.id })
      .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
      .andWhere({ isBanned: bannedFlags.isBanned });

    // Check if entity already exists
    const existingEntity: ImagesBlogsWallpaperMetadataEntity | null =
      await queryBuilder.getOne();

    // If entity exists, update it; otherwise, create a new one
    if (existingEntity) {
      existingEntity.url = urlEtagDto.url;
      existingEntity.eTag = urlEtagDto.eTag;
      existingEntity.originalName = fileUploadDto.originalname;
      existingEntity.encoding = fileUploadDto.encoding;
      existingEntity.mimetype = fileUploadDto.mimetype;
      existingEntity.buffer = fileUploadDto.buffer;
      existingEntity.size = fileUploadDto.size;
      existingEntity.createdAt = new Date().toISOString();
      imagesBlogWallpaperFileMetadataEntity = existingEntity;
    } else {
      imagesBlogWallpaperFileMetadataEntity =
        ImagesBlogsWallpaperMetadataEntity.createImagesBlogWallpaperFileMetadataEntity(
          blog,
          fileUploadDto,
          urlEtagDto,
          currentUserDto,
        );
    }

    try {
      return await this.imagesBlogsWallpaperFileMetadataRepository.save(
        imagesBlogWallpaperFileMetadataEntity,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating or updating the post image file metadata.',
      );
    }
  }

  async createImagesBlogMain(
    blog: BloggerBlogsEntity,
    fileUploadDto: FileUploadDtoDto,
    urlEtagDto: UrlEtagDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ImagesBlogsWallpaperMetadataEntity> {
    const bannedFlags = await this.getBannedFlags();
    let imagesBlogMainMetadataEntity: ImagesBlogsMainMetadataEntity;

    const queryBuilder = this.imagesBlogsMainMetadataRepository
      .createQueryBuilder('image') // Start building a query
      .leftJoinAndSelect('image.blog', 'blog')
      .where('blog.id = :blogId', { blogId: blog.id })
      .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
      .andWhere({ isBanned: bannedFlags.isBanned });

    // Check if entity already exists
    const existingEntity: ImagesBlogsMainMetadataEntity | null =
      await queryBuilder.getOne();

    // If entity exists, update it; otherwise, create a new one
    if (existingEntity) {
      existingEntity.url = urlEtagDto.url;
      existingEntity.eTag = urlEtagDto.eTag;
      existingEntity.originalName = fileUploadDto.originalname;
      existingEntity.encoding = fileUploadDto.encoding;
      existingEntity.mimetype = fileUploadDto.mimetype;
      existingEntity.buffer = fileUploadDto.buffer;
      existingEntity.size = fileUploadDto.size;
      existingEntity.createdAt = new Date().toISOString();
      imagesBlogMainMetadataEntity = existingEntity;
    } else {
      imagesBlogMainMetadataEntity =
        ImagesBlogsMainMetadataEntity.createImagesBlogsMainFileMetadataEntity(
          blog,
          fileUploadDto,
          urlEtagDto,
          currentUserDto,
        );
    }

    try {
      return await this.imagesBlogsMainMetadataRepository.save(
        imagesBlogMainMetadataEntity,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating or updating the post image file metadata.',
      );
    }
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
