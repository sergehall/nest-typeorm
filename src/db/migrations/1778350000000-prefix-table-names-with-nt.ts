import { MigrationInterface, QueryRunner } from 'typeorm';

export class PrefixTableNamesWithNt1778350000000 implements MigrationInterface {
  name = 'PrefixTableNamesWithNt1778350000000';

  private readonly tableRenames: Array<[from: string, to: string]> = [
    ['ChallengeQuestions', 'nt-ChallengeQuestions'],
    ['PairsGame', 'nt-PairsGame'],
    ['ChallengeAnswers', 'nt-ChallengeAnswers'],
    ['BannedUsersForBlogs', 'nt-BannedUsersForBlogs'],
    ['Orders', 'nt-Orders'],
    ['GuestUsers', 'nt-GuestUsers'],
    ['OrderItems', 'nt-OrderItems'],
    ['ProductsData', 'nt-ProductsData'],
    ['Comments', 'nt-Comments'],
    ['PaymentTransactions', 'nt-PaymentTransactions'],
    ['LikeStatusComments', 'nt-LikeStatusComments'],
    ['Posts', 'nt-Posts'],
    ['ImagesPostsMiddleMetadata', 'nt-ImagesPostsMiddleMetadata'],
    ['LikeStatusPosts', 'nt-LikeStatusPosts'],
    ['ImagesPostsOriginalMetadata', 'nt-ImagesPostsOriginalMetadata'],
    ['SecurityDevices', 'nt-SecurityDevices'],
    ['ImagesPostsSmallMetadata', 'nt-ImagesPostsSmallMetadata'],
    ['TelegramBotStatus', 'nt-TelegramBotStatus'],
    ['QuestionsQuiz', 'nt-QuestionsQuiz'],
    ['ImagesPostsMetadataEntity', 'nt-ImagesPostsMetadataEntity'],
    ['InvalidJwt', 'nt-InvalidJwt'],
    ['ImagesBlogsMainMetadata', 'nt-ImagesBlogsMainMetadata'],
    ['ImagesBlogsWallpaperMetadata', 'nt-ImagesBlogsWallpaperMetadata'],
    ['BlogsSubscribers', 'nt-BlogsSubscribers'],
    ['BloggerBlogs', 'nt-BloggerBlogs'],
    ['Messages', 'nt-Messages'],
    ['Conversations', 'nt-Conversations'],
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [from, to] of this.tableRenames) {
      await queryRunner.query(`ALTER TABLE IF EXISTS "${from}" RENAME TO "${to}"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [from, to] of [...this.tableRenames].reverse()) {
      await queryRunner.query(`ALTER TABLE IF EXISTS "${to}" RENAME TO "${from}"`);
    }
  }
}
