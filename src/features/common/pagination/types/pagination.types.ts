import { TablesUsersEntity } from '../../../users/entities/tables-users.entity';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { ReturnBloggerBlogsEntity } from '../../../blogger-blogs/entities/return-blogger-blogs.entity';
import { ReturnBannedUsersForBlogEntity } from '../../../blogger-blogs/entities/return-banned-users-for-blog.entity';
import { ReturnUsersBanInfoEntity } from '../../../sa/entities/return-users-banInfo.entity';
import { ReturnCommentsEntity } from '../../../comments/entities/return-comments.entity';
import { ReturnPostsEntity } from '../../../posts/entities/return-posts-entity.entity';

export type PaginationTypes = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items:
    | TablesUsersEntity[]
    | TableBloggerBlogsRawSqlEntity[]
    | ReturnCommentsEntity[]
    | ReturnPostsEntity[]
    | ReturnBloggerBlogsEntity[]
    | ReturnUsersBanInfoEntity[]
    | ReturnBannedUsersForBlogEntity[];
};
