import { IsString, IsNumber, IsEnum, IsInt } from 'class-validator';
import { PublishedStatusEnum } from '../enums/published-status.enum';
import { SortDirectionEnum } from '../enums/sort-direction.enum';
import { BanCondition } from '../types/ban-condition.type';
import { SortType } from '../types/sort.type';

export class QueryPagination {
  @IsNumber()
  pageNumber: number;

  @IsNumber()
  pageSize: number;

  @IsString()
  sortBy: string;

  @IsEnum(SortDirectionEnum)
  sortDirection: SortDirectionEnum;
}
export class ProductsDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class ParseQueriesDto {
  products: ProductsDto[];

  @IsInt()
  countProducts: number;

  @IsString()
  title: string;

  @IsString()
  userName: string;

  @IsString()
  code: string;

  @IsString()
  confirmationCode: string;

  @IsString()
  searchTitle: string;

  @IsString()
  searchNameTerm: string;

  @IsString()
  searchLoginTerm: string;

  @IsString()
  searchEmailTerm: string;

  @IsString()
  bodySearchTerm: string;

  sort: SortType;

  @IsNumber()
  queryPagination: QueryPagination;

  banStatus: BanCondition;

  publishedStatus: PublishedStatusEnum;
}
