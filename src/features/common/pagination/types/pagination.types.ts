import { UsersEntity } from '../../../users/entities/users.entity';
import { SortOrder } from '../../parse-query/types/sort-order.types';
import { PostsEntity } from '../../../posts/entities/posts.entity';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { CommentsEntity } from '../../../comments/entities/comments.entity';
import { UsersBannedByBlogIdEntity } from '../../../blogger-blogs/entities/blogger-blogs-banned-users.entity';
import { PostsReturnEntity } from '../../../posts/entities/posts-without-ownerInfo.entity';
import { TablesUsersEntity } from '../../../users/entities/tablesUsers.entity';
import { UsersReturnEntity } from '../../../users/entities/usersReturn.entity';
import { TableBloggerBlogsRawSqlEntity } from '../../../blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { ReturnBloggerBlogsEntity } from '../../../blogger-blogs/entities/return-blogger-blogs.entity';
import { CommentsReturnEntity } from '../../../comments/entities/comments-return.entity';

export type PaginationTypes = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items:
    | PostsEntity[]
    | CommentsEntity[]
    | BloggerBlogsEntity[]
    | UsersEntity[]
    | UsersBannedByBlogIdEntity[]
    | PostsReturnEntity[]
    | TablesUsersEntity[]
    | UsersReturnEntity[]
    | TableBloggerBlogsRawSqlEntity[]
    | ReturnBloggerBlogsEntity[]
    | CommentsReturnEntity[];
};
export type PaginationDBType = {
  startIndex: number;
  pageSize: number;
  field: string;
  direction: SortOrder;
};
