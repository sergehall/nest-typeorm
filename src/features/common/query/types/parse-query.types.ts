import { QueryPaginationType } from './query-pagination-types';
import { BanConditionType } from './ban-condition.types';

// Type for the parsed query parameters
export type ParseQueriesType = {
  title: string;
  userName: string;
  code: string;
  confirmationCode: string;
  searchTitle: string;
  searchNameTerm: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
  queryPagination: QueryPaginationType;
  banStatus: BanConditionType;
};
