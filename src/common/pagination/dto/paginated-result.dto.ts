import { TablesUsersEntity } from '../../../features/users/entities/tables-users.entity';
import { TableBloggerBlogsRawSqlEntity } from '../../../features/blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';
import { BannedUserForBlogViewModel } from '../../../features/users/view-models/banned-user-for-blog.view-model';
import { CommentViewModel } from '../../../features/comments/view-models/comment.view-model';
import { PostWithLikesInfoViewModel } from '../../../features/posts/view-models/post-with-likes-info.view-model';
import { IsArray, IsNumber, IsObject } from 'class-validator';
import { ReturnBloggerBlogsDto } from '../../../features/blogger-blogs/entities/return-blogger-blogs.entity';
import { ReturnUsersDto } from '../../../features/sa/dto/return-users.dto';
import { QuestionsViewModel } from '../../../features/sa-quiz-questions/view-models/questions.view-model';
import { GameViewModel } from '../../../features/pair-game-quiz/view-models/game.view-model';
import { GamesStatisticsViewModel } from '../../../features/pair-game-quiz/view-models/games-statistics.view-model';

export class PaginatedResultDto {
  @IsNumber()
  pagesCount: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsNumber()
  totalCount: number;

  @IsArray()
  @IsObject({ each: true })
  items: (
    | TablesUsersEntity
    | TableBloggerBlogsRawSqlEntity
    | CommentViewModel
    | PostWithLikesInfoViewModel
    | ReturnBloggerBlogsDto
    | ReturnUsersDto
    | BannedUserForBlogViewModel
    | QuestionsViewModel
    | GameViewModel
    | GamesStatisticsViewModel
  )[];
}
