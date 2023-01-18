import { Module } from '@nestjs/common';
import { blogsProviders } from './infrastructure/blogs.providers';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { PostsService } from '../posts/posts.service';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { BlogExistsRule } from '../pipes/blog-exist-validation';

@Module({
  imports: [DatabaseModule],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsRepository,
    PostsService,
    Pagination,
    PostsRepository,
    CaslAbilityFactory,
    LikeStatusPostsRepository,
    ConvertFiltersForDB,
    BlogExistsRule,
    ...blogsProviders,
  ],
})
export class BlogsModule {}
