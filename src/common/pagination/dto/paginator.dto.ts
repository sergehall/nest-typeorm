import { IsArray, IsNumber, IsObject } from 'class-validator';
import { BannedUserForBlogViewModel } from '../../../features/users/view-models/banned-user-for-blog.view-model';
import { CommentViewModel } from '../../../features/comments/view-models/comment.view-model';
import { PostWithLikesInfoViewModel } from '../../../features/posts/view-models/post-with-likes-info.view-model';
import { QuestionsViewModel } from '../../../features/sa-quiz-questions/view-models/questions.view-model';
import { GameViewModel } from '../../../features/pair-game-quiz/view-models/game.view-model';
import { GamesStatisticsViewModel } from '../../../features/pair-game-quiz/view-models/games-statistics.view-model';
import { BloggerBlogsViewModel } from '../../../features/blogger-blogs/view-models/blogger-blogs.view-model';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { SaUserViewModel } from '../../../features/sa/view-models/sa-user-view-model';

export class PaginatorDto {
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
    | UsersEntity
    | SaUserViewModel
    | CommentViewModel
    | PostWithLikesInfoViewModel
    | BloggerBlogsViewModel
    | BannedUserForBlogViewModel
    | QuestionsViewModel
    | GameViewModel
    | GamesStatisticsViewModel
  )[];
}
