import { Injectable } from '@nestjs/common';
import { SortOrder } from './types/sort-order.types';
import { BanStatusTypes } from './types/ban-status.types';
type QueryPaginationType = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortOrder;
};
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

@Injectable()
export class ParseQuery {
  static getPaginationData(query: any) {
    let pageNumber: number = parseInt(<string>query.pageNumber);
    let pageSize: number = parseInt(<string>query.pageSize);
    let searchNameTerm: string = query.searchNameTerm?.toString();
    let searchLoginTerm: string = query.searchLoginTerm?.toString();
    let searchEmailTerm: string = query.searchEmailTerm?.toString();
    let title: string = query.sitle?.toString();
    let userName: string = query.searchName?.toString();
    let searchTitle: string = query.searchTitle?.toString();
    let code: string = query.sode?.toString();
    let confirmationCode: string = query.sonfirmationCode?.toString();
    const querySortBy: string = query.sortBy?.toString();
    let sortBy = 'createdAt';
    const querySortDirection: SortOrder = query?.sortDirection;
    let sortDirection: SortOrder = 'desc';
    const queryBanStatus: string = query.banStatus?.toString();
    let banStatus: BanStatusTypes = '';
    if (queryBanStatus === 'banned') {
      banStatus = 'true';
    } else if (queryBanStatus === 'notBanned') {
      banStatus = 'false';
    }
    if (!searchNameTerm) {
      searchNameTerm = '';
    }
    if (!searchLoginTerm) {
      searchLoginTerm = '';
    }
    if (!searchEmailTerm) {
      searchEmailTerm = '';
    }
    if (!confirmationCode) {
      confirmationCode = '';
    }
    if (!code) {
      code = '';
    }
    if (!searchTitle) {
      searchTitle = '';
    }
    if (!title) {
      title = '';
    }
    if (!userName) {
      userName = '';
    }
    if (isNaN(pageNumber)) {
      pageNumber = 1;
    }
    if (isNaN(pageSize)) {
      pageSize = 10;
    }
    if (
      querySortBy === 'login' ||
      querySortBy === 'email' ||
      querySortBy === 'name' ||
      querySortBy === 'websiteUrl' ||
      querySortBy === 'description' ||
      querySortBy === 'shortDescription' ||
      querySortBy === 'title' ||
      querySortBy === 'blogName' ||
      querySortBy === 'content'
    ) {
      sortBy = querySortBy;
    }
    if (
      [-1, 1, 'descending', 'desc', 'ascending', 'asc'].includes(
        querySortDirection,
      )
    ) {
      sortDirection = querySortDirection;
    }
    if (Number(querySortDirection) === 1) {
      sortDirection = 1;
    }
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
