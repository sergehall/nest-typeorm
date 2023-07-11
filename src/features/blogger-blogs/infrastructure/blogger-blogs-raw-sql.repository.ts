import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaginationDBType } from '../../common/pagination/types/pagination.types';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';

export class BloggerBlogsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findBlogById(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity | null> {
    try {
      const blog = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
      "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus", 
      "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason", 
      "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1`,
        [blogId],
      );
      return blog[0] ? blog[0] : null;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
  async openFindBlogs(
    pagination: PaginationDBType,
    queryData: ParseQueryType,
  ): Promise<TableBloggerBlogsRawSqlEntity[]> {
    try {
      // const preparedQuery = await this._prepQueryRawSql(pagination, queryData);
      const blogOwnerBanStatus = false;
      const banInfoBanStatus = false;
      const searchNameTerm =
        queryData.searchNameTerm.length !== 0
          ? `%${queryData.searchNameTerm}%`
          : '%';
      const orderByWithDirection = `"${pagination.field}" ${pagination.direction}`;
      return await this.db.query(
        `
        SELECT "id", "createdAt", "isMembership",
        "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus",  
        "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason", 
        "name", "description", "websiteUrl"
        FROM public."BloggerBlogs"
        WHERE "blogOwnerBanStatus" = $1 AND "banInfoBanStatus" = $2
        AND "name" LIKE $3
        ORDER BY $4
        LIMIT $5 OFFSET $6
      `,
        [
          blogOwnerBanStatus,
          banInfoBanStatus,
          searchNameTerm,
          orderByWithDirection,
          pagination.pageSize,
          pagination.startIndex,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async totalCountBlogs(
    pagination: PaginationDBType,
    queryData: ParseQueryType,
  ): Promise<number> {
    try {
      const blogOwnerBanStatus = false;
      const banInfoBanStatus = false;
      const searchNameTerm =
        queryData.searchNameTerm.length !== 0
          ? `%${queryData.searchNameTerm}%`
          : '%';
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."BloggerBlogs"
        WHERE "blogOwnerBanStatus" = $1 AND "banInfoBanStatus" = $2
        AND "name" LIKE $3
      `,
        [blogOwnerBanStatus, banInfoBanStatus, searchNameTerm],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async isBannedUserForBlog(
    blogOwnerId: string,
    blogId: string,
  ): Promise<boolean> {
    try {
      const blog: TableBloggerBlogsRawSqlEntity[] = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
        "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus", 
        "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason", 
        "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1 AND "blogOwnerId" = $2 AND "banInfoBanStatus" = true`,
        [blogId, blogOwnerId],
      );
      return blog.length !== 0;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createBlogs(
    bloggerBlogsRawSqlEntity: TableBloggerBlogsRawSqlEntity,
  ): Promise<TableBloggerBlogsRawSqlEntity> {
    try {
      const createNewBlog = await this.db.query(
        `
        INSERT INTO public."BloggerBlogs"(
        "id", "createdAt", "isMembership", 
        "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus", 
        "banInfoBanStatus", "banInfoBanDate", "banInfoBanReason", 
        "name",  "description", "websiteUrl")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          returning "id", "name", "description", "websiteUrl", "createdAt", "isMembership"`,
        [
          bloggerBlogsRawSqlEntity.id,
          bloggerBlogsRawSqlEntity.createdAt,
          bloggerBlogsRawSqlEntity.isMembership,
          bloggerBlogsRawSqlEntity.blogOwnerId,
          bloggerBlogsRawSqlEntity.blogOwnerLogin,
          bloggerBlogsRawSqlEntity.blogOwnerBanStatus,
          bloggerBlogsRawSqlEntity.banInfoBanStatus,
          bloggerBlogsRawSqlEntity.banInfoBanDate,
          bloggerBlogsRawSqlEntity.banInfoBanReason,
          bloggerBlogsRawSqlEntity.name,
          bloggerBlogsRawSqlEntity.description,
          bloggerBlogsRawSqlEntity.websiteUrl,
        ],
      );
      return createNewBlog[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
  async _prepQueryRawSql(
    pagination: PaginationDBType,
    queryData: ParseQueryType,
  ) {
    try {
      const direction = [-1, 'ascending', 'asc'].includes(pagination.direction)
        ? 'asc'
        : 'desc';

      const orderByWithDirection = `"${pagination.field}" ${direction}`;
      const banCondition =
        queryData.banStatus === ''
          ? [true, false]
          : queryData.banStatus === 'true'
          ? [true]
          : [false];
      const searchEmailTerm =
        queryData.searchEmailTerm.toLocaleLowerCase().length !== 0
          ? `%${queryData.searchEmailTerm.toLocaleLowerCase()}%`
          : '';
      let searchLoginTerm =
        queryData.searchLoginTerm.toLocaleLowerCase().length !== 0
          ? `%${queryData.searchLoginTerm.toLocaleLowerCase()}%`
          : '';
      if (searchEmailTerm.length + searchLoginTerm.length === 0) {
        searchLoginTerm = '%%';
      }
      return {
        orderByWithDirection: orderByWithDirection,
        banCondition: banCondition,
        searchEmailTerm: searchEmailTerm,
        searchLoginTerm: searchLoginTerm,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
