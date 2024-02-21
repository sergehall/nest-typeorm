import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { BloggerBlogsViewModel } from '../views/blogger-blogs.view-model';
import {
  BloggerBlogsWithImagesViewModel,
  Image,
  ImagesViewModel,
} from '../views/blogger-blogs-with-images.view-model';
import { FileMetadata } from '../../../common/helpers/file-metadata-from-buffer.service/dto/file-metadata';
import { UrlDto } from '../dto/url.dto';
import { FileMetadataService } from '../../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { S3Service } from '../../../config/aws/s3/s3-service';
import { ImagesBlogsWallpaperMetadataRepo } from '../infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from '../infrastructure/images-blogs-main-metadata.repo';

@Injectable()
export class BloggerBlogsService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly fileMetadataService: FileMetadataService,
    private readonly imagesBlogsMainMetadataRepo: ImagesBlogsMainMetadataRepo,
    private readonly imagesBlogsWallpaperMetadataRepo: ImagesBlogsWallpaperMetadataRepo,
  ) {}

  async addImagesToBlogsEntity(
    newBlog: BloggerBlogsViewModel,
  ): Promise<BloggerBlogsWithImagesViewModel> {
    const images = new ImagesViewModel();
    return {
      ...newBlog, // Spread properties of newBlog
      images, // Add extended images
    };
  }
  async blogsImagesAggregation(
    blogs: BloggerBlogsEntity[],
  ): Promise<BloggerBlogsWithImagesViewModel[]> {
    // Extracting IDs of blogs
    const blogsIds = blogs.map((blog) => blog.id);
    // Array to store aggregated results
    const resultMap: BloggerBlogsWithImagesViewModel[] = [];

    // Fetching image metadata for wallpapers and main images in parallel
    const [imagesBlogsWallpaper, imagesBlogsMain] = await Promise.all([
      this.imagesBlogsWallpaperMetadataRepo.findImagesBlogsWallpaperByIds(
        blogsIds,
      ),
      this.imagesBlogsMainMetadataRepo.findImagesBlogsMainByIds(blogsIds),
    ]);

    // Iterating over each blog to aggregate image data
    for (const blog of blogs) {
      // Retrieving wallpaper metadata for the current blog
      const wallpaperMetadata = imagesBlogsWallpaper[blog.id];
      // Retrieving main image metadata for the current blog
      const mainMetadata = imagesBlogsMain[blog.id];
      // Initializing variables to store image data
      let imageBlogWallpaper: Image | null = null;
      const imagesBlogMain: Image[] = [];

      // Processing wallpaper image if metadata exists
      if (wallpaperMetadata) {
        // Extracting metadata for wallpaper image
        const metadata: FileMetadata =
          await this.fileMetadataService.extractFromBuffer(
            wallpaperMetadata.buffer,
          );
        // Generating signed URL for wallpaper image
        const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
          wallpaperMetadata.pathKey,
        );
        // Constructing wallpaper image object
        imageBlogWallpaper = {
          url: unitedUrl.url,
          width: metadata.width,
          height: metadata.height,
          fileSize: metadata.fileSize,
        };
      }

      // Processing main images if metadata exists
      if (mainMetadata && mainMetadata.length > 0) {
        // Fetching metadata for main images in parallel
        await Promise.all(
          mainMetadata.map(async (metadata) => {
            // Extracting metadata for main image
            const fileMetadata: FileMetadata =
              await this.fileMetadataService.extractFromBuffer(metadata.buffer);
            // Generating signed URL for main image
            const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
              metadata.pathKey,
            );
            // Constructing main image object and pushing it to the array
            imagesBlogMain.push({
              url: unitedUrl.url,
              width: fileMetadata.width,
              height: fileMetadata.height,
              fileSize: fileMetadata.fileSize,
            });
          }),
        );
      }

      // Constructing the final result object for the current blog and pushing it to the result array
      resultMap.push({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        images: { wallpaper: imageBlogWallpaper, main: imagesBlogMain },
      });
    }

    // Returning the aggregated results
    return resultMap;
  }

  async transformedBlogs(
    blogsArr: BloggerBlogsEntity[],
  ): Promise<BloggerBlogsViewModel[]> {
    return blogsArr.map((row: BloggerBlogsEntity) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      websiteUrl: row.websiteUrl,
      createdAt: row.createdAt,
      isMembership: row.isMembership,
    }));
  }
}
