import { InjectRepository } from '@nestjs/typeorm';
import { ImagesBlogsMainMetadataEntity } from '../entities/images-blog-main-metadata.entity';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BannedFlagsDto } from '../../posts/dto/banned-flags.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { FileUploadDto } from '../dto/file-upload.dto';
import { UrlPathKeyEtagDto } from '../dto/url-pathKey-etag.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { ImagesBlogsWallpaperMetadataEntity } from '../entities/images-blog-wallpaper-metadata.entity';

export class ImagesBlogsMainMetadataRepo {
  constructor(
    @InjectRepository(ImagesBlogsMainMetadataEntity)
    protected imagesBlogsMainMetadataRepository: Repository<ImagesBlogsMainMetadataEntity>,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async findImageBlogMainById(
    blogId: string,
  ): Promise<ImagesBlogsMainMetadataEntity | null> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

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
        const userId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(
          `Blog Wallpaper with ID ${userId} not found`,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findImagesBlogsMainByIds(
    blogIds: string[],
  ): Promise<{ [id: string]: ImagesBlogsMainMetadataEntity[] }> {
    const bannedFlags: BannedFlagsDto = await this.getBannedFlags();
    const { dependencyIsBanned, isBanned } = bannedFlags;

    const queryBuilder = this.imagesBlogsMainMetadataRepository
      .createQueryBuilder('blogsMain') // Start building a query
      .leftJoinAndSelect('blogsMain.blogOwner', 'blogOwner')
      .leftJoinAndSelect('blogsMain.blog', 'blog')
      .where('blogsMain.blogId IN (:...blogIds)', { blogIds })
      .andWhere({ isBanned })
      .andWhere({ dependencyIsBanned });

    try {
      const blogsMain = await queryBuilder.getMany(); // Execute the query and get multiple results

      const resultMap: { [id: string]: ImagesBlogsMainMetadataEntity[] } = {};
      blogsMain.forEach((blogMain) => {
        if (!resultMap[blogMain.blog.id]) {
          resultMap[blogMain.blog.id] = []; // Initialize the array if not exists
        }
        resultMap[blogMain.blog.id].push(blogMain);
      });

      return resultMap; // Return the retrieved blogs main metadata with their associated blogOwners as an object with IDs as keys
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

  async createImagesBlogMain(
    blog: BloggerBlogsEntity,
    fileUploadDto: FileUploadDto,
    urlPathKeyEtagDto: UrlPathKeyEtagDto,
    currentUserDto: CurrentUserDto,
  ): Promise<ImagesBlogsWallpaperMetadataEntity> {
    // const bannedFlags = await this.getBannedFlags();
    // let imagesBlogMainMetadataEntity: ImagesBlogsMainMetadataEntity;
    //
    // const queryBuilder = this.imagesBlogsMainMetadataRepository
    //   .createQueryBuilder('image') // Start building a query
    //   .leftJoinAndSelect('image.blog', 'blog')
    //   .where('blog.id = :blogId', { blogId: blog.id })
    //   .andWhere({ dependencyIsBanned: bannedFlags.dependencyIsBanned })
    //   .andWhere({ isBanned: bannedFlags.isBanned });

    // Check if entity already exists
    const imagesBlogMainMetadataEntity: ImagesBlogsMainMetadataEntity =
      ImagesBlogsMainMetadataEntity.createImagesBlogsMainFileMetadataEntity(
        blog,
        fileUploadDto,
        urlPathKeyEtagDto,
        currentUserDto,
      );
    // await queryBuilder.getOne();

    // // If entity exists, update it; otherwise, create a new one
    // if (existingEntity) {
    //   existingEntity.pathKey = urlPathKeyEtagDto.pathKey;
    //   existingEntity.eTag = urlPathKeyEtagDto.eTag;
    //   existingEntity.originalName = fileUploadDto.originalname;
    //   existingEntity.encoding = fileUploadDto.encoding;
    //   existingEntity.mimetype = fileUploadDto.mimetype;
    //   existingEntity.buffer = fileUploadDto.buffer;
    //   existingEntity.size = fileUploadDto.size;
    //   existingEntity.createdAt = new Date().toISOString();
    //   imagesBlogMainMetadataEntity = existingEntity;
    // } else {
    //   imagesBlogMainMetadataEntity =
    //     ImagesBlogsMainMetadataEntity.createImagesBlogsMainFileMetadataEntity(
    //       blog,
    //       fileUploadDto,
    //       urlPathKeyEtagDto,
    //       currentUserDto,
    //     );
    // }

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
}
