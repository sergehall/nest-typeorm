import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { TablesUsersWithIdEntity } from '../../users/entities/tables-user-with-id.entity';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { KeyArrayProcessor } from '../../common/query/get-key-from-array-or-default';
import { TablesBloggerBlogsTotalBlogs } from '../entities/tables-blogger-blogs-total-blogs';

export class BloggerBlogsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyArrayProcessor: KeyArrayProcessor,
  ) {}

  async findBlogById(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity | null> {
    const dependencyIsBanned = false;
    const banInfoIsBanned = false;

    try {
      const blog = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
      "blogOwnerId", "dependencyIsBanned",
      "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason", 
      "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
      `,
        [blogId, dependencyIsBanned, banInfoIsBanned],
      );

      // Return the first blog if found, if not found return null
      return blog[0] || null;
    } catch (error) {
      console.log(error.message);
      // if not blogId not UUID will be error, and return null
      return null;
    }
  }

  async findBlogsCurrentUser(
    currentUserDto: CurrentUserDto,
    queryData: ParseQueriesType,
  ): Promise<TableBloggerBlogsRawSqlEntity[]> {
    const blogOwnerBanStatus = false;
    const banInfoBanStatus = false;
    const { id } = currentUserDto;
    const searchNameTerm = queryData.searchNameTerm;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset = (queryData.queryPagination.pageNumber - 1) * limit;

    const query = `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."BloggerBlogs"
        WHERE "dependencyIsBanned" = $1
        AND "banInfoIsBanned" = $2
        AND "blogOwnerId" = $3
        AND "name" ILIKE $4
        ORDER BY "${sortBy}" COLLATE "C" ${direction}
        LIMIT $5
        OFFSET $6
        `;

    const params = [
      blogOwnerBanStatus,
      banInfoBanStatus,
      id,
      searchNameTerm,
      limit,
      offset,
    ];

    try {
      return await this.db.query(query, params);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async openFindBlogsTotalBlogs(
    queryData: ParseQueriesType,
  ): Promise<TablesBloggerBlogsTotalBlogs[]> {
    try {
      const blogOwnerBanStatus = false;
      const banInfoBanStatus = false;
      const searchNameTerm = queryData.searchNameTerm;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

      const parameters = [
        blogOwnerBanStatus,
        banInfoBanStatus,
        searchNameTerm,
        limit,
        offset,
      ];

      const mainQuery = `
        WITH FilteredBlogs AS (
            SELECT
                "id", "name", "description", "websiteUrl", "createdAt", "isMembership",
                COUNT(*) OVER() AS "totalBlogs"
            FROM public."BloggerBlogs"
            WHERE
                "dependencyIsBanned" = $1 AND
                "banInfoIsBanned" = $2 AND
                "name" ILIKE $3
        )
        SELECT
            "id", "name", "description", "websiteUrl", "createdAt", "isMembership", "totalBlogs"::integer
        FROM FilteredBlogs
        ORDER BY "${sortBy}" COLLATE "C" ${direction}
        LIMIT $4 OFFSET $5
    `;

      const query = `
        SELECT json_agg(result) FROM (
            ${mainQuery}
        ) AS result
    `;

      const result = await this.db.query(query, parameters);

      return result[0].json_agg !== null ? result[0] : [];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async saTotalCountBlogs(queryData: ParseQueriesType): Promise<number> {
    try {
      const searchNameTerm = queryData.searchNameTerm;

      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."BloggerBlogs"
        WHERE "name" ILIKE $1
      `,
        [searchNameTerm],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async saFindBlogs(
    queryData: ParseQueriesType,
  ): Promise<TableBloggerBlogsRawSqlEntity[]> {
    try {
      const searchNameTerm = queryData.searchNameTerm;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

      return await this.db.query(
        `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership", 
        "blogOwnerId", "blogOwnerLogin", "banInfoIsBanned", "banInfoBanDate"
        FROM public."BloggerBlogs"
        WHERE "name" ILIKE $1
        ORDER BY "${sortBy}" COLLATE "C" ${direction}
        LIMIT $2 OFFSET $3
        `,
        [searchNameTerm, limit, offset],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async totalCountBlogsByUserId(
    blogOwnerId: string,
    queryData: ParseQueriesType,
  ): Promise<number> {
    try {
      const blogOwnerBanStatus = false;
      const banInfoBanStatus = false;
      const searchNameTerm = queryData.searchNameTerm;

      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."BloggerBlogs"
        WHERE "dependencyIsBanned" = $1
        AND "banInfoIsBanned" = $2
        AND "blogOwnerId" = $3
        AND "name" ILIKE $4
      `,
        [blogOwnerBanStatus, banInfoBanStatus, blogOwnerId, searchNameTerm],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatedBlogById(
    newBlog: TableBloggerBlogsRawSqlEntity,
  ): Promise<boolean> {
    try {
      const { id, name, description, websiteUrl } = newBlog;

      const updatedBlogById = await this.db.query(
        `
      UPDATE public."BloggerBlogs"
      SET  "name" = $2, "description" = $3, "websiteUrl" = $4
      WHERE "id" = $1
      RETURNING *`,
        [id, name, description, websiteUrl],
      );
      return updatedBlogById[1] === 1;
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
        "blogOwnerId", "blogOwnerLogin", "dependencyIsBanned", 
        "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason", 
        "name",  "description", "websiteUrl")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          returning "id", "name", "description", "websiteUrl", "createdAt", "isMembership"`,
        [
          bloggerBlogsRawSqlEntity.id,
          bloggerBlogsRawSqlEntity.createdAt,
          bloggerBlogsRawSqlEntity.isMembership,
          bloggerBlogsRawSqlEntity.blogOwnerId,
          bloggerBlogsRawSqlEntity.blogOwnerLogin,
          bloggerBlogsRawSqlEntity.dependencyIsBanned,
          bloggerBlogsRawSqlEntity.banInfoIsBanned,
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

  async changeBanStatusBlogsDependencyIsBannedByUserId(
    userId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      const result = await this.db.query(
        `
      UPDATE public."BloggerBlogs"
      SET "dependencyIsBanned" = $2
      WHERE "blogOwnerId" = $1
      `,
        [userId, isBanned],
      );

      return result[1] !== 0;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeBanStatusBlogsByBlogId(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      const isBannedDate = new Date().toISOString();

      const updateBanStatusBlog = await this.db.query(
        `
      UPDATE public."BloggerBlogs"
      SET "banInfoIsBanned" = $2, "banInfoBanDate" = $3
      WHERE "id" = $1
      `,
        [blogId, isBanned, isBannedDate],
      );
      return updateBanStatusBlog[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeBlogsByUserId(userId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."BloggerBlogs"
        WHERE "blogOwnerId" = $1
          `,
        [userId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async removeBlogsByBlogId(blogId: string): Promise<boolean> {
    try {
      return await this.db.query(
        `
        DELETE FROM public."BloggerBlogs"
        WHERE "id" = $1
          `,
        [blogId],
      );
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }

  async findBlogByBlogId(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity | null> {
    try {
      const dependencyIsBanned = false;
      const banInfoIsBanned = false;

      const blog = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
      "blogOwnerId", "dependencyIsBanned",
      "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason", 
      "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
      `,
        [blogId, dependencyIsBanned, banInfoIsBanned],
      );
      // Return the first blog if found, if not found return null
      return blog[0] || null;
    } catch (error) {
      console.log(error.message);
      // if not blogId not UUID will be error, and return null
      return null;
    }
  }

  async saFindBlogByBlogId(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity | null> {
    try {
      const blog = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
      "blogOwnerId", "dependencyIsBanned",
      "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason", 
      "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1
      `,
        [blogId],
      );
      // Return the first blog if found, if not found return null
      return blog[0] || null;
    } catch (error) {
      console.log(error.message);
      // if not blogId not UUID will be error, and return null
      return null;
    }
  }

  async changeIntoBlogBlogOwner(
    blogId: string,
    userForBind: TablesUsersWithIdEntity,
  ): Promise<boolean> {
    const { id, login } = userForBind;

    try {
      return await this.db.query(
        `
        UPDATE public."BloggerBlogs"
        SET "blogOwnerId" = $2, "blogOwnerLogin" = $3
        WHERE "id" = $1
        `,
        [blogId, id, login],
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyArrayProcessor.getKeyFromArrayOrDefault(
      sortBy,
      [
        'isMembership',
        'blogOwnerLogin',
        'dependencyIsBanned',
        'banInfoIsBanned',
        'banInfoBanDate',
        'banInfoBanReason',
        'name',
        'description',
        'websiteUrl',
      ],
      'createdAt',
    );
  }
}
