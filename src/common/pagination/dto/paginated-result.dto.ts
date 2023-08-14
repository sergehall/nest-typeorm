import { TablesUsersEntity } from '../../../features/users/entities/tables-users.entity';
import { TableBloggerBlogsRawSqlEntity } from '../../../features/blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { ReturnBloggerBlogsEntity } from '../../../features/blogger-blogs/entities/return-blogger-blogs.entity';
import { ReturnBannedUsersForBlogEntity } from '../../../features/blogger-blogs/entities/return-banned-users-for-blog.entity';
import { ReturnUsersBanInfoEntity } from '../../../features/sa/entities/return-users-banInfo.entity';
import { ReturnCommentsEntity } from '../../../features/comments/entities/return-comments.entity';
import { ReturnPostsEntity } from '../../../features/posts/entities/return-posts-entity.entity';
import { IsArray, IsNumber, IsObject } from 'class-validator';

export class PaginatedResultDto {
  @IsNumber()
  pagesCount: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsNumber()
  totalCount: number;

  @IsArray()
  @IsObject({ each: true })
  items: (
    | TablesUsersEntity
    | TableBloggerBlogsRawSqlEntity
    | ReturnCommentsEntity
    | ReturnPostsEntity
    | ReturnBloggerBlogsEntity
    | ReturnUsersBanInfoEntity
    | ReturnBannedUsersForBlogEntity
  )[];
}
