import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ParseQueryType } from '../../common/parse-query/parse-query';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';

export class BloggerBlogsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findBlogById(
    blogId: string,
  ): Promise<TableBloggerBlogsRawSqlEntity | null> {
    const blogOwnerBanStatus = false;
    const banInfoIsBanned = false;
    try {
      const blog = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
      "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus", 
      "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason", 
      "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1 AND "blogOwnerBanStatus" = $2 AND "banInfoIsBanned" = $3
      `,
        [blogId, blogOwnerBanStatus, banInfoIsBanned],
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
    queryData: ParseQueryType,
  ): Promise<TableBloggerBlogsRawSqlEntity[]> {
    try {
      const blogOwnerBanStatus = false;
      const banInfoBanStatus = false;
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        queryData.queryPagination.sortDirection,
      )
        ? 'ASC'
        : 'DESC';
      return await this.db.query(
        `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."BloggerBlogs"
        WHERE "blogOwnerBanStatus" = $1 AND "banInfoIsBanned" = $2 AND "blogOwnerId" = $3
        ORDER BY "${queryData.queryPagination.sortBy}" ${direction}
        LIMIT $4 OFFSET $5
        `,
        [
          blogOwnerBanStatus,
          banInfoBanStatus,
          currentUserDto.id,
          queryData.queryPagination.pageSize,
          queryData.queryPagination.pageNumber - 1,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async openFindBlogs(
    queryData: ParseQueryType,
  ): Promise<TableBloggerBlogsRawSqlEntity[]> {
    try {
      const blogOwnerBanStatus = false;
      const banInfoBanStatus = false;
      const direction = [-1, 'ascending', 'ASCENDING', 'asc', 'ASC'].includes(
        queryData.queryPagination.sortDirection,
      )
        ? 'ASC'
        : 'DESC';
      const searchNameTerm =
        queryData.searchNameTerm.length !== 0
          ? `%${queryData.searchNameTerm}%`
          : '%%';
      return await this.db.query(
        `
        SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
        FROM public."BloggerBlogs"
        WHERE "blogOwnerBanStatus" = $1 AND "banInfoBanStatus" = $2
        AND "name" ILIKE $3
        ORDER BY "${queryData.queryPagination.sortBy}" ${direction}
        LIMIT $4 OFFSET $5
        `,
        [
          blogOwnerBanStatus,
          banInfoBanStatus,
          searchNameTerm,
          queryData.queryPagination.pageSize,
          queryData.queryPagination.pageNumber - 1,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async totalCountBlogs(queryData: ParseQueryType): Promise<number> {
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

  async totalCountBlogsByUserId(blogOwnerId: string): Promise<number> {
    try {
      const blogOwnerBanStatus = false;
      const banInfoBanStatus = false;
      const countBlogs = await this.db.query(
        `
        SELECT count(*)
        FROM public."BloggerBlogs"
        WHERE "blogOwnerBanStatus" = $1 AND "banInfoIsBanned" = $2 AND "blogOwnerId" = $3
      `,
        [blogOwnerBanStatus, banInfoBanStatus, blogOwnerId],
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
    const banInfoIsBanned = true;
    try {
      const blog: TableBloggerBlogsRawSqlEntity[] = await this.db.query(
        `
      SELECT "id", "createdAt", "isMembership", 
        "blogOwnerId", "blogOwnerLogin", "blogOwnerBanStatus", 
        "banInfoIsBanned", "banInfoBanDate", "banInfoBanReason", 
        "name", "description", "websiteUrl"
      FROM public."BloggerBlogs"
      WHERE "id" = $1 AND "blogOwnerId" = $2 AND "banInfoIsBanned" = $3
      `,
        [blogId, blogOwnerId, banInfoIsBanned],
      );
      return blog.length !== 0;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async updatedBlogById(
    newBlog: TableBloggerBlogsRawSqlEntity,
  ): Promise<boolean> {
    try {
      const updatedBlogById = await this.db.query(
        `
      UPDATE public."BloggerBlogs"
      SET  "name" = $2, "description" = $3, "websiteUrl" = $4
      WHERE "id" = $1
      RETURNING *`,
        [newBlog.id, newBlog.name, newBlog.description, newBlog.websiteUrl],
      );
      return updatedBlogById.length !== 0;
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
          bloggerBlogsRawSqlEntity.blogOwnerBanStatus,
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
  async removeBlogById(blogId: string): Promise<boolean> {
    try {
      const comment = await this.db.query(
        `
        DELETE FROM public."BloggerBlogs"
        WHERE "id" = $1
        RETURNING "id"
          `,
        [blogId],
      );
      return comment[1] === 1;
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(error.message);
    }
  }
}
