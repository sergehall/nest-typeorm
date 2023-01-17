import { Module } from '@nestjs/common';
import { bBlogsProviders } from './infrastructure/bblogs.providers';
import { BBlogsController } from './bblogs.controller';
import { BBlogsService } from './bblogs.service';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { BBlogsRepository } from './infrastructure/bblogs.repository';
import { PostsService } from '../posts/posts.service';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { CaslAbilityFactory } from '../ability/casl-ability.factory';
import { LikeStatusPostsRepository } from '../posts/infrastructure/like-status-posts.repository';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { BlogExistsRule } from '../pipes/blog-exist-validation';

@Module({
  imports: [DatabaseModule],
  controllers: [BBlogsController],
  providers: [
    BBlogsService,
    BBlogsRepository,
    PostsService,
    Pagination,
    PostsRepository,
    CaslAbilityFactory,
    LikeStatusPostsRepository,
    ConvertFiltersForDB,
    BlogExistsRule,
    ...bBlogsProviders,
  ],
})
export class BBlogsModule {}
