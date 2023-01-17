import { Injectable } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { PaginationDBType } from './types/pagination.types';

@Injectable()
export class Pagination {
  async convert(
    queryPagination: PaginationDto,
    field: string,
  ): Promise<PaginationDBType> {
    const startIndex =
      (queryPagination.pageNumber - 1) * queryPagination.pageSize;
    const pageSize = queryPagination.pageSize;
    const direction = queryPagination.sortDirection;
    return {
      startIndex,
      pageSize,
      field,
      direction,
    };
  }
}
