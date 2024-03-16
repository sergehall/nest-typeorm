import { Injectable } from '@nestjs/common';
import { ParseQueriesDto, ProductsDto } from './dto/parse-queries.dto';
import { PublishedStatusEnum } from './enums/published-status.enum';
import { SortDirectionEnum } from './enums/sort-direction.enum';
import { BanCondition } from './types/ban-condition.type';
import { SortType } from './types/sort.type';

@Injectable()
export class ParseQueriesService {
  private async parsePageNumber(query: any): Promise<number> {
    const parsedPageNumber = parseInt(query.pageNumber, 10);

    if (!isNaN(parsedPageNumber) && parsedPageNumber > 0) {
      return parsedPageNumber;
    } else {
      return 1; // Default value when parsing fails or the value is not positive.
    }
  }

  private async parsePageSize(query: any): Promise<number> {
    const parsedPageSize = parseInt(query.pageSize, 10);

    if (!isNaN(parsedPageSize) && parsedPageSize > 0) {
      return parsedPageSize;
    } else {
      return 10; // Default value when parsing fails or the value is not positive.
    }
  }

  private async parseCountProducts(query: any): Promise<number> {
    const parsedPageSize = parseInt(query.countProducts, 10);

    if (!isNaN(parsedPageSize) && parsedPageSize > 0) {
      return parsedPageSize;
    } else {
      return 10; // Default value when parsing fails or the value is not positive.
    }
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

  private async parseSort(query: any): Promise<SortType> {
    // Default value
    const parsedSort: SortType = [
      {
        avgScores: SortDirectionEnum.DESC,
      },
      {
        sumScore: SortDirectionEnum.DESC,
      },
    ];

    const sort: any[] = [];

    const sortParams = query?.sort
      ?.toString()
      .split(',')
      .map((param: any) => param.trim());

    if (sortParams === undefined) {
      return parsedSort; // Return the default object if sortParams is undefined
    }
    const directionValueArr = ['ascending', 'ASCENDING', 'asc', 'ASC', -1];

    sortParams.forEach((param: any) => {
      const [property, direction] = param.split(' ');

      const directionAvgScores = directionValueArr.includes(direction)
        ? SortDirectionEnum.ASC
        : SortDirectionEnum.DESC;
      sort.push({ [property]: directionAvgScores });
    });
    const hasAvgScores = sort.some((obj) => 'avgScores' in obj);
    const hasSumScore = sort.some((obj) => 'sumScore' in obj);
    if (!hasAvgScores) {
      sort.push(parsedSort[0]);
    }
    if (!hasSumScore) {
      sort.push(parsedSort[1]);
    }
    return sort;
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

  private async parseProductsString(query: any): Promise<ProductsDto[]> {
    const products = [];
    const productIdArray = query.productId;
    const quantityArray = query.quantity;

    if (!productIdArray || !quantityArray) {
      return [];
    }
    // Ensure both arrays have the same length
    if (productIdArray.length !== quantityArray.length) {
      throw new Error(
        'productId and quantity arrays must have the same length',
      );
    }

    for (let i = 0; i < productIdArray.length; i++) {
      const productId = productIdArray[i];
      const quantity = quantityArray[i];
      products.push({ productId, quantity: parseInt(quantity) });
    }

    return products;
  }

  async getQueriesData(query: any): Promise<ParseQueriesDto> {
    return {
      queryPagination: {
        pageNumber: await this.parsePageNumber(query),
        pageSize: await this.parsePageSize(query),
        sortBy: await this.parseSortBy(query),
        sortDirection: await this.parseSortDirection(query),
      },
      products: await this.parseProductsString(query),
      countProducts: await this.parseCountProducts(query),
      sort: await this.parseSort(query),
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
