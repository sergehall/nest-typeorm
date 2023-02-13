import { UsersEntity } from '../../../users/entities/users.entity';
import { SortOrder } from '../../parse-query/types/sort-order.types';
import { PostsEntity } from '../../../posts/entities/posts.entity';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { CommentsEntity } from '../../../comments/entities/comments.entity';
import { BBlogsBannedUsersEntity } from '../../../comments/entities/bBlogs-banned-users.entity';

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
    | BBlogsBannedUsersEntity[];
};
export type PaginationDBType = {
  startIndex: number;
  pageSize: number;
  field: string;
  direction: SortOrder;
};
