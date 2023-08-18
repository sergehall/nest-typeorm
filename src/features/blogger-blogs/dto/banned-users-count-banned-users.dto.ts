import { ReturnBannedUsersForBlogEntity } from '../entities/return-banned-users-for-blog.entity';

export class BannedUsersCountBannedUsersDto {
  bannedUsers: ReturnBannedUsersForBlogEntity[];
  countBannedUsers: number;
}
