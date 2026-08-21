import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export type CollectionQueryFilter =
  | 'banStatus'
  | 'bodySearchTerm'
  | 'publishedStatus'
  | 'searchEmailTerm'
  | 'searchLoginTerm'
  | 'searchNameTerm';

export interface ApiCollectionQueryOptions {
  filters?: CollectionQueryFilter[];
  sortByExample?: string;
}

const FILTER_DOCUMENTATION: Record<CollectionQueryFilter, MethodDecorator> = {
  banStatus: ApiQuery({
    name: 'banStatus',
    required: false,
    enum: ['all', 'banned', 'notBanned'],
    description: 'Filter users by their ban status.',
    example: 'all',
  }),
  bodySearchTerm: ApiQuery({
    name: 'bodySearchTerm',
    required: false,
    type: String,
    description: 'Case-insensitive substring matched against the question body.',
    example: 'typescript',
  }),
  publishedStatus: ApiQuery({
    name: 'publishedStatus',
    required: false,
    enum: ['all', 'published', 'notPublished'],
    description: 'Filter questions by publication status.',
    example: 'all',
  }),
  searchEmailTerm: ApiQuery({
    name: 'searchEmailTerm',
    required: false,
    type: String,
    description: 'Case-insensitive substring matched against an email address.',
    example: 'example.com',
  }),
  searchLoginTerm: ApiQuery({
    name: 'searchLoginTerm',
    required: false,
    type: String,
    description: 'Case-insensitive substring matched against a user login.',
    example: 'alex',
  }),
  searchNameTerm: ApiQuery({
    name: 'searchNameTerm',
    required: false,
    type: String,
    description: 'Case-insensitive substring matched against a blog name.',
    example: 'engineering',
  }),
};

/** Documents the query contract implemented by ParseQueriesService. */
export function ApiCollectionQuery(options: ApiCollectionQueryOptions = {}): MethodDecorator {
  const paginationDecorators: MethodDecorator[] = [
    ApiQuery({
      name: 'pageNumber',
      required: false,
      type: Number,
      minimum: 1,
      default: 1,
      description: 'One-based page number.',
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: Number,
      minimum: 1,
      default: 10,
      description: 'Number of items returned per page.',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Response field used to order the collection.',
      example: options.sortByExample ?? 'createdAt',
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: ['asc', 'desc'],
      default: 'desc',
      description: 'Sort direction. Values are case-insensitive.',
    }),
  ];
  const filterDecorators = (options.filters ?? []).map((filter) => FILTER_DOCUMENTATION[filter]);

  return applyDecorators(...paginationDecorators, ...filterDecorators);
}

export function ApiStatisticsQuery(): MethodDecorator {
  return applyDecorators(
    ApiQuery({
      name: 'pageNumber',
      required: false,
      type: Number,
      minimum: 1,
      default: 1,
      description: 'One-based page number.',
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: Number,
      minimum: 1,
      default: 10,
      description: 'Number of players returned per page.',
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      type: String,
      description:
        'Comma-separated priority list in "field direction" format. Supported fields are avgScores and sumScore.',
      example: 'avgScores desc,sumScore desc',
    }),
  );
}

export function ApiConfirmationCodeQuery(): MethodDecorator {
  return ApiQuery({
    name: 'code',
    required: true,
    type: String,
    description: 'Registration confirmation code delivered by email.',
    example: 'f65fc8f3-3503-4f01-93ab-0ff1cd4188ad',
  });
}

export function ApiProductCountQuery(): MethodDecorator {
  return ApiQuery({
    name: 'countProducts',
    required: false,
    type: Number,
    minimum: 1,
    default: 10,
    description: 'Number of random test products to create.',
  });
}
