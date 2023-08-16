import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { TablesUsersWithIdEntity } from '../../users/entities/tables-user-with-id.entity';
import { ReturnBloggerBlogsEntity } from '../entities/return-blogger-blogs.entity';
import { SaBanBlogDto } from '../../sa/dto/sa-ban-blog.dto';
import { BannedUsersForBlogsEntity } from '../entities/banned-users-for-blogs.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';

export class BloggerBlogsRawSqlRepository {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    protected keyResolver: KeyResolver,
  ) {}

  async findBlogById(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity | null> {
    const dependencyIsBanned = false;
    const banInfoIsBanned = false;

    const query = `
        SELECT "id", "createdAt", "isMembership", 
         "blogOwnerId", "dependencyIsBanned",
         "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason", 
         "name", "description", "websiteUrl"
        FROM public."BloggerBlogs"
        LEFT JOIN (
            SELECT 1 AS empty
            WHERE NOT EXISTS (
                SELECT 1
                FROM public."BloggerBlogs"
                WHERE "id" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
            )
        ) AS empty_check ON empty_check.empty = 1
        WHERE "id" = $1 AND "dependencyIsBanned" = $2 AND "banInfoIsBanned" = $3
        `;

    const parameters = [blogId, dependencyIsBanned, banInfoIsBanned];

    try {
      const result = await this.db.query(query, parameters);

      if (result && result.length > 0) {
        return result[0];
      } else {
        return null;
      }
    } catch (error) {
      console.log(error.message);
      // if not blogId not UUID will be error, and return null
      return null;
    }
  }

  async searchUserBlogs(
    currentUserDto: CurrentUserDto,
    queryData: ParseQueriesDto,
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

  async openSearchBlogs(
    queryData: ParseQueriesDto,
  ): Promise<ReturnBloggerBlogsEntity[]> {
    try {
      const blogOwnerBanStatus = false;
      const banInfoBanStatus = false;
      const searchNameTerm = queryData.searchNameTerm;
      const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
      const direction = queryData.queryPagination.sortDirection;
      const limit = queryData.queryPagination.pageSize;
      const offset = (queryData.queryPagination.pageNumber - 1) * limit;

      const query = `
        WITH FilteredBlogs AS (
            SELECT
                "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
            FROM public."BloggerBlogs"
            WHERE
                "dependencyIsBanned" = $1 AND
                "banInfoIsBanned" = $2 AND
                "name" ILIKE $3
        )
        SELECT
            "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM FilteredBlogs
        ORDER BY "${sortBy}" COLLATE "C" ${direction}
        LIMIT $4 OFFSET $5
      `;

      const parameters = [
        blogOwnerBanStatus,
        banInfoBanStatus,
        searchNameTerm,
        limit,
        offset,
      ];

      return await this.db.query(query, parameters);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async openCountBlogs(queryData: ParseQueriesDto): Promise<number> {
    const blogOwnerBanStatus = false;
    const banInfoBanStatus = false;
    const searchNameTerm = queryData.searchNameTerm;
    try {
      const countBlogs = await this.db.query(
        `
        SELECT COUNT(*)
        FROM public."BloggerBlogs"
        WHERE "dependencyIsBanned" = $1
          AND "banInfoIsBanned" = $2
          AND "name" ILIKE $3;
      `,
        [blogOwnerBanStatus, banInfoBanStatus, searchNameTerm],
      );
      return Number(countBlogs[0].count);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async saTotalCountBlogs(queryData: ParseQueriesDto): Promise<number> {
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
    queryData: ParseQueriesDto,
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

  async totalCountUserBlogs(
    blogOwnerId: string,
    queryData: ParseQueriesDto,
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

  async banUnbanBlogForUser(
    bannedUserForBlogEntity: BannedUsersForBlogsEntity,
  ): Promise<boolean> {
    const { id, login, userId, blogId, isBanned, banDate, banReason } =
      bannedUserForBlogEntity;
    try {
      await this.db.transaction(async (client) => {
        // Update LikeStatusPosts table
        await client.query(
          `
        UPDATE public."LikeStatusPosts"
        SET "isBanned" = $3
        WHERE "userId" = $1 AND "blogId" = $2
        `,
          [userId, blogId, isBanned],
        );

        // Update LikeStatusComments table
        await client.query(
          `
        UPDATE public."LikeStatusComments"
        SET "isBanned" = $3
        WHERE ("userId" = $1 AND "blogId" = $2) OR ("commentOwnerId" = $1 AND "blogId" = $2)
        `,
          [userId, blogId, isBanned],
        );

        // Update Comments table
        await client.query(
          `
        UPDATE public."Comments"
        SET "banInfoIsBanned" = $3, "banInfoBanDate" = $4, "banInfoBanReason" = $5 
        WHERE "commentatorInfoUserId" = $1 AND "postInfoBlogId" = $2
        `,
          [userId, blogId, isBanned, banDate, banReason],
        );
        if (isBanned) {
          // Insert or Update BannedUsersForBlogs table
          await client.query(
            `
          INSERT INTO public."BannedUsersForBlogs"
          ("id", "login", "isBanned", "banDate", "banReason", "blogId", "userId")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT ("blogId", "userId", "isBanned")
          DO UPDATE SET "banDate" = $4, "banReason" = $5
          RETURNING "id";
        `,
            [id, login, isBanned, banDate, banReason, blogId, userId],
          );
        } else {
          // Delete record from BannedUsersForBlogs table if unBan user
          await client.query(
            `
          DELETE FROM public."BannedUsersForBlogs"
          WHERE "blogId" = $1 AND "userId" = $2
          RETURNING "id";
        `,
            [blogId, userId],
          );
        }
      });
      if (isBanned) {
        // Successful User Ban Message
        console.log(`User ${userId} Ban 🚫. For blog ${blogId}.`);
      } else {
        // Successful User unBan Message
        console.log(`User ${userId} Unban 🚪 for blog ${blogId}.`);
      }
      return true;
    } catch (error) {
      console.error(
        `Error occurred while banning user ${userId} for blog ${blogId}:`,
        error,
      );
      return false;
    }
  }

  async saBanUnbanBlog(
    blogId: string,
    saBanBlogDto: SaBanBlogDto,
  ): Promise<boolean> {
    const { isBanned } = saBanBlogDto;
    const isBannedDate = isBanned ? new Date().toISOString() : null;
    try {
      await this.db.transaction(async (client) => {
        // Update BloggerBlogs table
        await client.query(
          `
        UPDATE public."BloggerBlogs"
        SET "banInfoIsBanned" = $2, "banInfoBanDate" = $3
        WHERE "id" = $1
        `,
          [blogId, isBanned, isBannedDate],
        );

        // Update Posts table
        await client.query(
          `
        UPDATE public."Posts"
        SET "dependencyIsBanned" = $2
        WHERE "blogId" = $1
        `,
          [blogId, isBanned],
        );

        // Update LikeStatusPosts table
        await client.query(
          `
        UPDATE public."LikeStatusPosts"
        SET "isBanned" = $2
        WHERE "blogId" = $1
        `,
          [blogId, isBanned],
        );

        // Update Comments table
        await client.query(
          `
        UPDATE public."Comments"
        SET "banInfoIsBanned" = $2
        WHERE "postInfoBlogId" = $1
        `,
          [blogId, isBanned],
        );

        // Update LikeStatusComments table
        await client.query(
          `
        UPDATE public."LikeStatusComments"
        SET "isBanned" = $2
        WHERE "blogId" = $1
        `,
          [blogId, isBanned],
        );
      });
      if (isBanned) {
        console.log(
          `Blog Locked 🔒. The blog with ID ${blogId} has been locked for the user. 
          Access to the blog and its content has been restricted as per the 
          defined policies or circumstances. Thank you for your understanding.`,
        );
      } else {
        // Successful Blog Unlock Message
        console.log(`Blog Unlocked 🚪. The blog with ID ${blogId} has been successfully unlocked. 
        Users can now access the blog and its content without any restrictions. 
        Thank you for your attention to ensuring a positive user experience.`);
      }
      return true;
    } catch (error) {
      console.error(
        `Error occurred while banning blog for blog ID ${blogId}:`,
        error,
      );
      return false;
    }
  }

  async saBindBlogWithUser(
    userForBind: TablesUsersWithIdEntity,
    blogForBind: TableBloggerBlogsRawSqlEntity,
  ): Promise<boolean> {
    try {
      await this.db.transaction(async (client) => {
        // Update Comments table
        await client.query(
          `
        UPDATE public."Comments"
        SET "postInfoBlogOwnerId" = $2
        WHERE "postInfoBlogId" = $1
        `,
          [blogForBind.id, userForBind.id],
        );

        // Update Posts table
        await client.query(
          `
        UPDATE public."Posts"
        SET "postOwnerId" = $2
        WHERE "blogId" = $1
        `,
          [blogForBind.id, userForBind.id],
        );

        // Update BloggerBlogs table
        await client.query(
          `
        UPDATE public."BloggerBlogs"
        SET "blogOwnerId" = $2, "blogOwnerLogin" = $3
        WHERE "id" = $1
        `,
          [blogForBind.id, userForBind.id, userForBind.login],
        );
      });

      console.log(
        `"🔗 Blog ${blogForBind.id} has been successfully bound with user ${userForBind.id}. 🔗"`,
      );
      return true;
    } catch (error) {
      console.error(
        `Error occurred while binding blog ${blogForBind.id} with user ${userForBind.id}:`,
        error,
      );
      return false;
    }
  }

  private async getSortBy(sortBy: string): Promise<string> {
    return await this.keyResolver.resolveKey(
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
