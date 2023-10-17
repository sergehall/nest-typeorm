import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TableBloggerBlogsRawSqlEntity } from '../entities/table-blogger-blogs-raw-sql.entity';
import { TablesUsersWithIdEntity } from '../../users/entities/tables-user-with-id.entity';
import { SaBanBlogDto } from '../../sa/dto/sa-ban-blog.dto';
import { TableBannedUsersForBlogsEntity } from '../entities/table-banned-users-for-blogs.entity';

export class BloggerBlogsRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

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

  async findBlogByBlogId2(
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
    bannedUserForBlogEntity: TableBannedUsersForBlogsEntity,
  ): Promise<boolean> {
    const { id, userId, blogId, isBanned, banDate, banReason } =
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
          ("id", "isBanned", "banDate", "banReason", "blogId", "userId")
          VALUES ($1, $2, $3, $4, $5, $6,)
          ON CONFLICT ("blogId", "userId", "isBanned")
          DO UPDATE SET "banDate" = $4, "banReason" = $5
          RETURNING "id";
        `,
            [id, isBanned, banDate, banReason, blogId, userId],
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
}
