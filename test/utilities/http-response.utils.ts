import { Response } from 'supertest';

export type JsonObject = Record<string, unknown>;

export interface TestBlog {
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly isMembership: boolean;
  readonly name: string;
  readonly websiteUrl: string;
}

export interface TestComment {
  readonly content: string;
  readonly createdAt: string;
  readonly id: string;
}

export interface TestPost {
  readonly blogId: string;
  readonly content: string;
  readonly createdAt: string;
  readonly id: string;
  readonly shortDescription: string;
  readonly title: string;
}

export interface TestUser {
  readonly createdAt: string;
  readonly email: string;
  readonly id: string;
  readonly login: string;
}

export interface TestUserRecord extends TestUser {
  readonly confirmationCode: string | null;
}

export interface TestPaginator<T> {
  readonly items: T[];
  readonly page: number;
  readonly pageSize: number;
  readonly pagesCount: number;
  readonly totalCount: number;
}

export const getResponseBody = (response: Response): unknown => {
  return response.body as unknown;
};

export function assertJsonObject(
  value: unknown,
  description = 'value',
): asserts value is JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Expected ${description} to be a JSON object.`);
  }
}

export const readArray = (object: JsonObject, key: string): unknown[] => {
  const value = object[key];
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${key} to be an array.`);
  }
  return value;
};

export const readBoolean = (object: JsonObject, key: string): boolean => {
  const value = object[key];
  if (typeof value !== 'boolean') {
    throw new Error(`Expected ${key} to be a boolean.`);
  }
  return value;
};

export const readNumber = (object: JsonObject, key: string): number => {
  const value = object[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Expected ${key} to be a finite number.`);
  }
  return value;
};

export const readString = (object: JsonObject, key: string): string => {
  const value = object[key];
  if (typeof value !== 'string') {
    throw new Error(`Expected ${key} to be a string.`);
  }
  return value;
};

export const readNullableString = (object: JsonObject, key: string): string | null => {
  const value = object[key];
  if (value !== null && typeof value !== 'string') {
    throw new Error(`Expected ${key} to be a string or null.`);
  }
  return value;
};

export const parseAccessToken = (body: unknown): string => {
  assertJsonObject(body, 'access token response');
  const accessToken = readString(body, 'accessToken');

  if (accessToken.split('.').length !== 3) {
    throw new Error('Expected accessToken to be a JWT.');
  }

  return accessToken;
};

export const parseTestUser = (body: unknown): TestUser => {
  assertJsonObject(body, 'user response');
  return {
    id: readString(body, 'id'),
    login: readString(body, 'login'),
    email: readString(body, 'email'),
    createdAt: readString(body, 'createdAt'),
  };
};

export const parseTestUserRecord = (body: unknown): TestUserRecord => {
  assertJsonObject(body, 'user record');
  return {
    id: readString(body, 'userId'),
    login: readString(body, 'login'),
    email: readString(body, 'email'),
    createdAt: readString(body, 'createdAt'),
    confirmationCode: readNullableString(body, 'confirmationCode'),
  };
};

export const parseTestBlog = (body: unknown): TestBlog => {
  assertJsonObject(body, 'blog response');
  return {
    id: readString(body, 'id'),
    name: readString(body, 'name'),
    description: readString(body, 'description'),
    websiteUrl: readString(body, 'websiteUrl'),
    createdAt: readString(body, 'createdAt'),
    isMembership: readBoolean(body, 'isMembership'),
  };
};

export const parseTestPost = (body: unknown): TestPost => {
  assertJsonObject(body, 'post response');
  return {
    id: readString(body, 'id'),
    title: readString(body, 'title'),
    shortDescription: readString(body, 'shortDescription'),
    content: readString(body, 'content'),
    blogId: readString(body, 'blogId'),
    createdAt: readString(body, 'createdAt'),
  };
};

export const parseTestComment = (body: unknown): TestComment => {
  assertJsonObject(body, 'comment response');
  return {
    id: readString(body, 'id'),
    content: readString(body, 'content'),
    createdAt: readString(body, 'createdAt'),
  };
};

export const parsePaginator = <T>(
  body: unknown,
  parseItem: (item: unknown) => T,
): TestPaginator<T> => {
  assertJsonObject(body, 'paginator response');
  return {
    pagesCount: readNumber(body, 'pagesCount'),
    page: readNumber(body, 'page'),
    pageSize: readNumber(body, 'pageSize'),
    totalCount: readNumber(body, 'totalCount'),
    items: readArray(body, 'items').map(parseItem),
  };
};

export const getValidationErrorFields = (body: unknown): string[] => {
  assertJsonObject(body, 'validation error response');
  return readArray(body, 'errorsMessages').map((error, index) => {
    assertJsonObject(error, `validation error at index ${index}`);
    return readString(error, 'field');
  });
};
