import { Injectable } from '@nestjs/common';
import { SortOrder } from './types/sort-order.types';
import { BanStatusTypes } from './types/ban-status.types';

// Type for pagination data in the query
type QueryPaginationType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortOrder;
};

// Type for the parsed query parameters
export type ParseQueryType = {
  queryPagination: QueryPaginationType;
  searchNameTerm: string;
  title: string;
  userName: string;
  searchTitle: string;
  code: string;
  confirmationCode: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
  banStatus: BanStatusTypes;
};

// An array of allowed sorting fields
const allowedSortingFields = [
  'login',
  'email',
  'name',
  'websiteUrl',
  'description',
  'shortDescription',
  'title',
  'blogName',
  'content',
];

const allowedSortDirection = [
  -1,
  1,
  'DESCENDING',
  'descending',
  'DESC',
  'desc',
  'ASCENDING',
  'ascending',
  'ASC',
  'asc',
];

@Injectable()
export class ParseQuery {
  static getPaginationData(query: any) {
    const pageNumber = parseInt(query.pageNumber, 10) || 1;
    const pageSize = parseInt(query.pageSize, 10) || 10;
    const searchNameTerm = query.searchNameTerm?.toString() || '';
    const searchLoginTerm = query.searchLoginTerm?.toString() || '';
    const searchEmailTerm = query.searchEmailTerm?.toString() || '';
    const title = query.title?.toString() || '';
    const userName = query.userName?.toString() || '';
    const searchTitle = query.searchTitle?.toString() || '';
    const code = query.code?.toString() || '';
    const confirmationCode = query.confirmationCode?.toString() || '';
    const querySortDirection: SortOrder = query?.sortDirection;
    const sortDirection: SortOrder = allowedSortDirection.includes(
      querySortDirection,
    )
      ? querySortDirection
      : 'desc';
    const queryBanStatus = query.banStatus?.toString();
    const banStatus: BanStatusTypes =
      queryBanStatus === 'banned'
        ? 'true'
        : queryBanStatus === 'notBanned'
        ? 'false'
        : '';
    console.log(query.sortBy, '----------query.sortBy---------');
    const sortBy = allowedSortingFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    return {
      queryPagination: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortDirection: sortDirection,
      },
      searchNameTerm: searchNameTerm,
      title: title,
      userName: userName,
      searchTitle: searchTitle,
      code: code,
      confirmationCode: confirmationCode,
      searchLoginTerm: searchLoginTerm,
      searchEmailTerm: searchEmailTerm,
      banStatus: banStatus,
    };
  }
}
