import { BannedUsersForBlogsEntity } from '../../users/entities/banned-users-for-blogs.entity';

export class BannedUsersEntityAndCountDto {
  bannedUsers: BannedUsersForBlogsEntity[];
  countBannedUsers: number;
}
