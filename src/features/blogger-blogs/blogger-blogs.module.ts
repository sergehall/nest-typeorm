import { Module } from '@nestjs/common';
import { bloggerBlogsProviders } from './infrastructure/blogger-blogs.providers';
import { BloggerBlogsController } from './application/blogger-blogs.controller';
import { BloggerBlogsService } from './application/blogger-blogs.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { PostsService } from '../posts/application/posts.service';
import { Pagination } from '../common/pagination/pagination';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { ConvertFiltersForDB } from '../common/convert-filters/convertFiltersForDB';
import { BlogExistsRule } from '../../pipes/blog-exist-validation';
import { BloggerBlogsRepository } from './infrastructure/blogger-blogs.repository';
import { CreateBloggerBlogUseCase } from './application/use-cases/create-blogger-blog.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogByIdUseCase } from './application/use-cases/update-blog-byId.use-case';
import { RemoveBlogByIdUseCase } from './application/use-cases/remove-blog-byId.use-case';

const bloggersBlogUseCases = [
  CreateBloggerBlogUseCase,
  UpdateBlogByIdUseCase,
  RemoveBlogByIdUseCase,
];

@Module({
  imports: [DatabaseModule, CqrsModule],
  controllers: [BloggerBlogsController],
  providers: [
    BloggerBlogsService,
    BloggerBlogsRepository,
    PostsService,
    Pagination,
    PostsRepository,
    CaslAbilityFactory,
    LikeStatusPostsRepository,
    ConvertFiltersForDB,
    BlogExistsRule,
    ...bloggersBlogUseCases,
    ...bloggerBlogsProviders,
  ],
})
export class BloggerBlogsModule {}
