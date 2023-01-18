import { UsersEntity } from '../../../../users/entities/users.entity';
import { SortOrder } from '../../parse-query/types/sort-order.types';
import { PostsEntity } from '../../../../posts/entities/posts.entity';
import { BBlogsEntity } from '../../../../bblogger/entities/bblogs.entity';
import { CommentsEntity } from '../../../../comments/entities/comments.entity';

export type PaginationTypes = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostsEntity[] | CommentsEntity[] | BBlogsEntity[] | UsersEntity[];
};
export type PaginationDBType = {
  startIndex: number;
  pageSize: number;
  field: string;
  direction: SortOrder;
};
