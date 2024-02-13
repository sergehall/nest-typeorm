import { KeyResolver } from '../../../common/helpers/key-resolver';
import { ImagesPostMetadataEntity } from '../entities/images-post-metadata.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BannedFlagsDto } from '../dto/banned-flags.dto';
import { Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { PostsEntity } from '../entities/posts.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { UrlEtagDto } from '../../blogger-blogs/dto/url-etag.dto';
import { FileUploadDtoDto } from '../../blogger-blogs/dto/file-upload.dto';
import { ImagesBlogWallpaperMetadataEntity } from '../../blogger-blogs/entities/images-blog-wallpaper-metadata.entity';

export class ImagesFileMetadataRepo {
  constructor(
    @InjectRepository(ImagesPostMetadataEntity)
    protected imagesPostFileMetadataRepository: Repository<ImagesPostMetadataEntity>,
    @InjectRepository(ImagesBlogWallpaperMetadataEntity)
    protected imagesBlogWallpaperFileMetadataRepository: Repository<ImagesBlogWallpaperMetadataEntity>,
    protected keyResolver: KeyResolver,
  ) {}

  async createPostsImagesFileMetadata(
    blog: BloggerBlogsEntity,
    post: PostsEntity,
    fileUploadDto: FileUploadDtoDto,
    urlEtagDto: UrlEtagDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ImagesPostMetadataEntity> {
    const bannedFlags = await this.getBannedFlags();
    let postsImagesFileMetadataEntity: ImagesPostMetadataEntity;

    const queryBuilder = this.imagesPostFileMetadataRepository
      .createQueryBuilder('image') // Start building a query
      .leftJoinAndSelect('image.blog', 'blog')
      .leftJoinAndSelect('image.post', 'post')
      .where('blog.id = :blogId', { blogId: blog.id })
      .andWhere('post.id = :postId', { postId: post.id })
      .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
      .andWhere({ isBanned: bannedFlags.isBanned });

    // Check if entity already exists
    const existingEntity: ImagesPostMetadataEntity | null =
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
        ImagesPostMetadataEntity.createPostsImagesFileMetadataEntity(
          blog,
          post,
          fileUploadDto,
          urlEtagDto,
          currentUserDto,
        );
    }

    try {
      return await this.imagesPostFileMetadataRepository.save(
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
  ): Promise<ImagesBlogWallpaperMetadataEntity> {
    const bannedFlags = await this.getBannedFlags();
    let imagesBlogWallpaperFileMetadataEntity: ImagesBlogWallpaperMetadataEntity;

    const queryBuilder = this.imagesBlogWallpaperFileMetadataRepository
      .createQueryBuilder('image') // Start building a query
      .leftJoinAndSelect('image.blog', 'blog')
      .where('blog.id = :blogId', { blogId: blog.id })
      .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
      .andWhere({ isBanned: bannedFlags.isBanned });

    // Check if entity already exists
    const existingEntity: ImagesBlogWallpaperMetadataEntity | null =
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
        ImagesBlogWallpaperMetadataEntity.createImagesBlogWallpaperFileMetadataEntity(
          blog,
          fileUploadDto,
          urlEtagDto,
          currentUserDto,
        );
    }

    try {
      return await this.imagesBlogWallpaperFileMetadataRepository.save(
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
