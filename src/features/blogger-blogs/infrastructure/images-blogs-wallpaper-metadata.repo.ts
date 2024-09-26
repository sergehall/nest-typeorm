import { InjectRepository } from '@nestjs/typeorm';
import { ImagesBlogsWallpaperMetadataEntity } from '../entities/images-blog-wallpaper-metadata.entity';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { FileUploadDto } from '../dto/file-upload.dto';
import { UrlPathKeyEtagDto } from '../dto/url-pathKey-etag.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { BannedFlagsDto } from '../../posts/dto/banned-flags.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';

export class ImagesBlogsWallpaperMetadataRepo {
  constructor(
    @InjectRepository(ImagesBlogsWallpaperMetadataEntity)
    protected imagesBlogsWallpaperFileMetadataRepository: Repository<ImagesBlogsWallpaperMetadataEntity>,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async findImageBlogWallpaperById(
    blogId: string,
  ): Promise<ImagesBlogsWallpaperMetadataEntity | null> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

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
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(
          `Blog Wallpaper with ID ${userId} not found`,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findImagesBlogsWallpaperByIds(
    blogIds: string[],
  ): Promise<{ [id: string]: ImagesBlogsWallpaperMetadataEntity }> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    const queryBuilder = this.imagesBlogsWallpaperFileMetadataRepository
      .createQueryBuilder('blogsWallpaper') // Start building a query
      .leftJoinAndSelect('blogsWallpaper.blogOwner', 'blogOwner')
      .leftJoinAndSelect('blogsWallpaper.blog', 'blog')
      .where('blogsWallpaper.blogId IN (:...blogIds)', { blogIds })
      .andWhere({ isBanned })
      .andWhere({ dependencyIsBanned });

    try {
      const blogsWallpapers = await queryBuilder.getMany(); // Execute the query and get multiple results

      const resultMap: { [id: string]: ImagesBlogsWallpaperMetadataEntity } =
        {};
      blogsWallpapers.forEach((blogWallpaper) => {
        resultMap[blogWallpaper.blog.id] = blogWallpaper;
      });

      return resultMap;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(
          `Blog Wallpaper with ID ${userId} not found`,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createImagesBlogWallpaper(
    blog: BloggerBlogsEntity,
    fileUploadDto: FileUploadDto,
    urlPathKeyEtagDto: UrlPathKeyEtagDto,
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
      existingEntity.pathKey = urlPathKeyEtagDto.pathKey;
      existingEntity.eTag = urlPathKeyEtagDto.eTag;
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
          urlPathKeyEtagDto,
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

  private async getBannedFlags(): Promise<BannedFlagsDto> {
    return {
      commentatorInfoIsBanned: false,
      dependencyIsBanned: false,
      banInfoIsBanned: false,
      isBanned: false,
    };
  }
}
