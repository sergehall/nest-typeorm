import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { TablesUsersWithIdEntity } from '../../users/entities/tables-user-with-id.entity';
import { SaBanBlogDto } from '../../sa/dto/sa-ban-blog.dto';
import { BannedUsersForBlogsEntity } from '../entities/banned-users-for-blogs.entity';
import { KeyResolver } from '../../../common/helpers/key-resolver';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { ReturnBloggerBlogsCountBlogsEntity } from '../entities/return-blogger-blogs-count-blogs.entity';
import { BlogsCountBlogsDto } from '../dto/blogs-count-blogs.dto';
import { CreateBloggerBlogsDto } from '../dto/create-blogger-blogs.dto';
import * as uuid4 from 'uuid4';
import { UpdateBBlogsDto } from '../dto/update-blogger-blogs.dto';
import { ReturnBloggerBlogsDto } from '../entities/return-blogger-blogs.entity';

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

  async searchUserBlogsAndCountBlogs(
    currentUserDto: CurrentUserDto,
    queryData: ParseQueriesDto,
  ): Promise<BlogsCountBlogsDto> {
    const blogOwnerBanStatus = false;
    const banInfoBanStatus = false;
    const { userId } = currentUserDto;
    const searchNameTerm = queryData.searchNameTerm;
    const sortBy = await this.getSortBy(queryData.queryPagination.sortBy);
    const direction = queryData.queryPagination.sortDirection;
    const limit = queryData.queryPagination.pageSize;
    const offset = (queryData.queryPagination.pageNumber - 1) * limit;

    const query = `
    WITH filtered_blogs AS (
      SELECT
          "id", "name", "description", "websiteUrl", "createdAt", "isMembership",
          CAST(count(*) OVER() AS INTEGER) AS "countBlogs"
        FROM public."BloggerBlogs"
        WHERE "dependencyIsBanned" = $1
        AND "banInfoIsBanned" = $2
        AND "blogOwnerId" = $3
        AND "name" ILIKE $4
      )
      SELECT *
      FROM filtered_blogs
      ORDER BY "${sortBy}" COLLATE "C" ${direction}
      LIMIT $5
      OFFSET $6;
    `;

    const params = [
      blogOwnerBanStatus,
      banInfoBanStatus,
      userId,
      searchNameTerm,
      limit,
      offset,
    ];

    try {
      const result = await this.db.query(query, params);

      return await this.transformedBlogsTotalCount(result);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async openSearchBlogs(
    queryData: ParseQueriesDto,
  ): Promise<ReturnBloggerBlogsDto[]> {
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

  async searchBlogsForSa(
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

  async totalCountBlogsForSa(queryData: ParseQueriesDto): Promise<number> {
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

  async updatedBlogById(
    id: string,
    updateBlogDto: UpdateBBlogsDto,
  ): Promise<boolean> {
    try {
      const { name, description, websiteUrl } = updateBlogDto;

      const updatedBlogById = await this.db.query(
        `
      UPDATE public."BloggerBlogs"
      SET  "name" = $2, "description" = $3, "websiteUrl" = $4
      WHERE "id" = $1
      RETURNING "id"
      `,
        [id, name, description, websiteUrl],
      );
      return updatedBlogById[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createBlogs(
    createBloggerBlogsDto: CreateBloggerBlogsDto,
    currentUser: CurrentUserDto,
  ): Promise<ReturnBloggerBlogsDto> {
    const blogsEntity = await this.createTablesBlogsEntity(
      createBloggerBlogsDto,
      currentUser,
    );

    const query = `
    INSERT INTO public."BloggerBlogs"(
    "id", "createdAt", "isMembership", 
    "blogOwnerId", "blogOwnerLogin", "dependencyIsBanned", 
    "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason", 
    "name",  "description", "websiteUrl")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING "id", "name", "description", "websiteUrl", "createdAt", "isMembership";
  `;

    const parameters = [
      blogsEntity.id,
      blogsEntity.createdAt,
      blogsEntity.isMembership,
      blogsEntity.blogOwnerId,
      blogsEntity.blogOwnerLogin,
      blogsEntity.dependencyIsBanned,
      blogsEntity.banInfoIsBanned,
      blogsEntity.banInfoBanDate,
      blogsEntity.banInfoBanReason,
      blogsEntity.name,
      blogsEntity.description,
      blogsEntity.websiteUrl,
    ];

    try {
      const createNewBlog = await this.db.query(query, parameters);
      return createNewBlog[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteBlogByBlogId(blogId: string): Promise<boolean> {
    try {
      await this.db.transaction(async (client) => {
        await client.query(
          `
          DELETE FROM public."LikeStatusComments"
          WHERE "blogId" = $1
          `,
          [blogId],
        );

        await client.query(
          `
          DELETE FROM public."LikeStatusPosts"
          WHERE "blogId" = $1
          `,
          [blogId],
        );

        await client.query(
          `
          DELETE FROM public."Comments"
          WHERE "postInfoBlogId" = $1
          `,
          [blogId],
        );

        await client.query(
          `
          DELETE FROM public."Posts"
          WHERE "blogId" = $1
          `,
          [blogId],
        );

        await client.query(
          `
          DELETE FROM public."BannedUsersForBlogs"
          WHERE "blogId" = $1
          `,
          [blogId],
        );

        await client.query(
          `
          DELETE FROM public."BloggerBlogs"
          WHERE "id" = $1
          `,
          [blogId],
        );
      });
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
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

  async manageBlogAccess(
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
        console.log(
          `User ${userId} has been blocked from accessing Blog ${blogId}. 🚫`,
        );
      } else {
        // Successful User unBan Message
        console.log(
          `User with ID ${userId} has been unbanned for the blog with ID ${blogId}🚪`,
        );
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
          [blogForBind.id, userForBind.userId],
        );

        // Update Posts table
        await client.query(
          `
        UPDATE public."Posts"
        SET "postOwnerId" = $2
        WHERE "blogId" = $1
        `,
          [blogForBind.id, userForBind.userId],
        );

        // Update BloggerBlogs table
        await client.query(
          `
        UPDATE public."BloggerBlogs"
        SET "blogOwnerId" = $2, "blogOwnerLogin" = $3
        WHERE "id" = $1
        `,
          [blogForBind.id, userForBind.userId, userForBind.login],
        );
      });

      console.log(
        `"🔗 Blog ${blogForBind.id} has been successfully bound with user ${userForBind.userId}. 🔗"`,
      );
      return true;
    } catch (error) {
      console.error(
        `Error occurred while binding blog ${blogForBind.id} with user ${userForBind.userId}:`,
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

  private async transformedBlogsTotalCount(
    blogsArr: ReturnBloggerBlogsCountBlogsEntity[],
  ): Promise<BlogsCountBlogsDto> {
    const blogs = blogsArr.map((row: ReturnBloggerBlogsCountBlogsEntity) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      websiteUrl: row.websiteUrl,
      createdAt: row.createdAt,
      isMembership: row.isMembership,
    }));
    const countBlogs = blogsArr.length > 0 ? blogsArr[0].countBlogs : 0;

    return { blogs, countBlogs };
  }

  private async createTablesBlogsEntity(
    dto: CreateBloggerBlogsDto,
    currentUser: CurrentUserDto,
  ): Promise<TableBloggerBlogsRawSqlEntity> {
    const { userId, login, isBanned } = currentUser;

    return {
      ...dto,
      id: uuid4(),
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerId: userId,
      blogOwnerLogin: login,
      dependencyIsBanned: isBanned,
      banInfoIsBanned: false,
      banInfoBanDate: null,
      banInfoBanReason: null,
    };
  }
}
