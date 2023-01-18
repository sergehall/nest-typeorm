import { UsersEntity } from '../../../../users/entities/users.entity';
import { SortOrder } from '../../parse-query/types/sort-order.types';
import { PostsEntity } from '../../../../posts/entities/posts.entity';
import { BlogsEntity } from '../../../../blogger/entities/blogs.entity';
import { CommentsEntity } from '../../../../comments/entities/comments.entity';

export type PaginationTypes = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostsEntity[] | CommentsEntity[] | BlogsEntity[] | UsersEntity[];
};
export type PaginationDBType = {
  startIndex: number;
  pageSize: number;
  field: string;
  direction: SortOrder;
};
