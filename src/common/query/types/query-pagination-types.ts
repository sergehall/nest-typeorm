// Type for pagination data in the query
import { SortDirectionType } from './sort-direction.types';

export type QueryPaginationType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirectionType;
};
