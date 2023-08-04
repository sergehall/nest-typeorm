import { Injectable } from '@nestjs/common';
import { SortDirectionType } from './types/sort-direction.types';
import { BanConditionType } from './types/ban-condition.types';
import { ParseQueriesType } from './types/parse-query.types';

@Injectable()
export class ParseQueriesService {
  private async parsePageNumber(query: any): Promise<number> {
    return parseInt(query.pageNumber, 10) || 1;
  }

  private async parsePageSize(query: any): Promise<number> {
    return parseInt(query.pageSize, 10) || 10;
  }

  private async parseSearchNameTerm(query: any): Promise<string> {
    const queryName = query.searchNameTerm?.toString();
    return queryName && queryName.length !== 0
      ? `%${queryName.toLowerCase()}%`
      : '%';
  }
  private async parseSearchLoginTerm(query: any): Promise<string> {
    const queryLogin = query.searchLoginTerm?.toString();
    return queryLogin && queryLogin.length !== 0
      ? `%${queryLogin.toLowerCase()}%`
      : '%';
  }

  private async parseSearchEmailTerm(query: any): Promise<string> {
    const queryEmail = query.searchEmailTerm?.toString();
    return queryEmail && queryEmail.length !== 0
      ? `%${queryEmail.toLowerCase()}%`
      : '%';
  }

  private async parseTitle(query: any): Promise<string> {
    const title = query.title?.toString();
    return title && title.length !== 0 ? `%${title.toLowerCase()}%` : '%';
  }

  private async parseUserName(query: any): Promise<string> {
    const userName = query.userName?.toString();
    return userName && userName.length !== 0
      ? `%${userName.toLowerCase()}%`
      : '%';
  }

  private async parseSearchTitle(query: any): Promise<string> {
    const searchTitle = query.searchTitle?.toString();
    return searchTitle && searchTitle.length !== 0
      ? `%${searchTitle.toLowerCase()}%`
      : '%';
  }

  private async parseCode(query: any): Promise<string> {
    const code = query.code?.toString();
    return code && code.length !== 0 ? `%${code.toLowerCase()}%` : '%';
  }

  private async parseConfirmationCode(query: any): Promise<string> {
    const confirmationCode = query.confirmationCode?.toString();
    return confirmationCode && confirmationCode.length !== 0
      ? `%${confirmationCode.toLowerCase()}%`
      : '%';
  }

  private async parseSortDirection(query: any): Promise<SortDirectionType> {
    const querySortDirection = query?.sortDirection;
    return [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
      querySortDirection,
    )
      ? 'ASC'
      : 'DESC';
  }

  private async parseBanStatus(query: any): Promise<BanConditionType> {
    const queryBanStatus = query.banStatus?.toString();

    if (queryBanStatus === 'banned') {
      return [true];
    } else if (queryBanStatus === 'notBanned') {
      return [false];
    } else {
      return [true, false];
    }
  }

  private async parseSortBy(query: any): Promise<string> {
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
    const sortBy = query.sortBy?.toString();
    return allowedSortingFields.includes(sortBy) ? sortBy : 'createdAt';
  }

  async getQueriesData(query: any): Promise<ParseQueriesType> {
    return {
      queryPagination: {
        pageNumber: await this.parsePageNumber(query),
        pageSize: await this.parsePageSize(query),
        sortBy: await this.parseSortBy(query),
        sortDirection: await this.parseSortDirection(query),
      },
      searchNameTerm: await this.parseSearchNameTerm(query),
      title: await this.parseTitle(query),
      userName: await this.parseUserName(query),
      searchTitle: await this.parseSearchTitle(query),
      code: await this.parseCode(query),
      confirmationCode: await this.parseConfirmationCode(query),
      searchLoginTerm: await this.parseSearchLoginTerm(query),
      searchEmailTerm: await this.parseSearchEmailTerm(query),
      banStatus: await this.parseBanStatus(query),
    };
  }
}
