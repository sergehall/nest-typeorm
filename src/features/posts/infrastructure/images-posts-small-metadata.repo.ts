import { InjectRepository } from '@nestjs/typeorm';
import { ImagesPostsSmallMetadataEntity } from '../entities/images-posts-small-metadata.entity';
import { Repository } from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../entities/posts.entity';
import { FileUploadDto } from '../../blogger-blogs/dto/file-upload.dto';
import { UrlPathKeyEtagDto } from '../../blogger-blogs/dto/url-pathKey-etag.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { BannedFlagsDto } from '../dto/banned-flags.dto';

export class ImagesPostsSmallMetadataRepo {
  constructor(
    @InjectRepository(ImagesPostsSmallMetadataEntity)
    protected imagesPostSmallMetadataRepository: Repository<ImagesPostsSmallMetadataEntity>,
  ) {}

  async createImagePostSmallMetadata(
    blog: BloggerBlogsEntity,
    post: PostsEntity,
    fileUploadDto: FileUploadDto,
    urlPathKeyEtagDto: UrlPathKeyEtagDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ImagesPostsSmallMetadataEntity> {
    const bannedFlags = await this.getBannedFlags();
    let postsImagesFileMetadataEntity: ImagesPostsSmallMetadataEntity;

    const queryBuilder = this.imagesPostSmallMetadataRepository
      .createQueryBuilder('image') // Start building a query
      .leftJoinAndSelect('image.blog', 'blog')
      .leftJoinAndSelect('image.post', 'post')
      .where('blog.id = :blogId', { blogId: blog.id })
      .andWhere('post.id = :postId', { postId: post.id })
      .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
      .andWhere({ isBanned: bannedFlags.isBanned });

    // Check if entity already exists
    const existingEntity: ImagesPostsSmallMetadataEntity | null =
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
        ImagesPostsSmallMetadataEntity.createPostsImagesSmallMetadataEntity(
          blog,
          post,
          fileUploadDto,
          urlPathKeyEtagDto,
          currentUserDto,
        );
    }

    try {
      return await this.imagesPostSmallMetadataRepository.save(
        postsImagesFileMetadataEntity,
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
