import { Injectable } from '@nestjs/common';
import { ParseQueriesDto } from './dto/parse-queries.dto';
import { PublishedStatusEnum } from './enums/published-status.enum';
import { SortDirectionEnum } from './enums/sort-direction.enum';
import { BanCondition } from './types/ban-condition.type';

@Injectable()
export class ParseQueriesService {
  private async parsePageNumber(query: any): Promise<number> {
    return parseInt(query.pageNumber, 10) || 1;
  }

  private async parsePageSize(query: any): Promise<number> {
    return parseInt(query.pageSize, 10) || 10;
  }

  private async parseCode(query: any): Promise<string> {
    return query?.code?.toString() || '';
  }

  private async parseConfirmationCode(query: any): Promise<string> {
    return query?.confirmationCode?.toString() || '';
  }

  private async parseSortBy(query: any): Promise<string> {
    return query?.sortBy?.toString() || '';
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

  private async parseBodySearchTerm(query: any): Promise<string> {
    const queryBody = query.bodySearchTerm?.toString();
    return queryBody && queryBody.length !== 0
      ? `%${queryBody.toLowerCase()}%`
      : '%';
  }

  private async parseSearchNameTerm(query: any): Promise<string> {
    const queryName = query.searchNameTerm?.toString();
    return queryName && queryName.length !== 0 ? `%${queryName}%` : '%';
  }

  private async parseTitle(query: any): Promise<string> {
    const title = query.title?.toString();
    return title && title.length !== 0 ? `%${title}%` : '%';
  }

  private async parseUserName(query: any): Promise<string> {
    const userName = query.userName?.toString();
    return userName && userName.length !== 0 ? `%${userName}%` : '%';
  }

  private async parseSearchTitle(query: any): Promise<string> {
    const searchTitle = query.searchTitle?.toString();
    return searchTitle && searchTitle.length !== 0 ? `%${searchTitle}%` : '%';
  }

  private async parseSortDirection(query: any): Promise<SortDirectionEnum> {
    const querySortDirection = query?.sortDirection;
    return ['ascending', 'ASCENDING', 'asc', 'ASC', -1].includes(
      querySortDirection,
    )
      ? SortDirectionEnum.ASC
      : SortDirectionEnum.DESC;
  }

  private async parseBanStatus(query: any): Promise<BanCondition> {
    const queryBanStatus = query.banStatus?.toString();

    if (queryBanStatus === 'banned') {
      return [true];
    } else if (queryBanStatus === 'notBanned') {
      return [false];
    } else {
      return [true, false];
    }
  }

  private async parsePublishedStatus(query: any): Promise<PublishedStatusEnum> {
    const queryPublishedStatus = query.publishedStatus?.toString();

    if (queryPublishedStatus === PublishedStatusEnum.PUBLISHED) {
      return PublishedStatusEnum.PUBLISHED;
    } else if (queryPublishedStatus === PublishedStatusEnum.NOTPUBLISHED) {
      return PublishedStatusEnum.NOTPUBLISHED;
    } else {
      return PublishedStatusEnum.ALL;
    }
  }

  async getQueriesData(query: any): Promise<ParseQueriesDto> {
    return {
      queryPagination: {
        pageNumber: await this.parsePageNumber(query),
        pageSize: await this.parsePageSize(query),
        sortBy: await this.parseSortBy(query),
        sortDirection: await this.parseSortDirection(query),
      },
      title: await this.parseTitle(query),
      userName: await this.parseUserName(query),
      code: await this.parseCode(query),
      confirmationCode: await this.parseConfirmationCode(query),
      searchTitle: await this.parseSearchTitle(query),
      searchNameTerm: await this.parseSearchNameTerm(query),
      searchLoginTerm: await this.parseSearchLoginTerm(query),
      searchEmailTerm: await this.parseSearchEmailTerm(query),
      bodySearchTerm: await this.parseBodySearchTerm(query),
      banStatus: await this.parseBanStatus(query),
      publishedStatus: await this.parsePublishedStatus(query),
    };
  }
}
