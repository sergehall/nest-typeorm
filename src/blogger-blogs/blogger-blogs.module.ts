import { Module } from '@nestjs/common';
import { bloggerBlogsProviders } from './infrastructure/blogger-blogs.providers';
import { BloggerBlogsController } from './blogger-blogs.controller';
import { BloggerBlogsService } from './blogger-blogs.service';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { PostsService } from '../posts/application/posts.service';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { BlogExistsRule } from '../pipes/blog-exist-validation';
import { BloggerBlogsRepository } from './infrastructure/blogger-blogs.repository';

@Module({
  imports: [DatabaseModule],
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
    ...bloggerBlogsProviders,
  ],
})
export class BloggerBlogsModule {}
