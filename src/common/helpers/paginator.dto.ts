import { IsArray, IsNumber, IsObject } from 'class-validator';
import { BannedUserForBlogViewModel } from '../../features/users/views/banned-user-for-blog.view-model';
import { CommentViewModel } from '../../features/comments/views/comment.view-model';
import { PostWithLikesInfoViewModel } from '../../features/posts/views/post-with-likes-info.view-model';
import { QuestionsViewModel } from '../../features/sa-quiz-questions/views/questions.view-model';
import { GameViewModel } from '../../features/pair-game-quiz/views/game.view-model';
import { GamesStatisticsViewModel } from '../../features/pair-game-quiz/views/games-statistics.view-model';
import { BloggerBlogsViewModel } from '../../features/blogger-blogs/views/blogger-blogs.view-model';
import { UsersEntity } from '../../features/users/entities/users.entity';
import { SaUserViewModel } from '../../features/sa/views/sa-user-view-model';
import { BloggerBlogsWithImagesViewModel } from '../../features/blogger-blogs/views/blogger-blogs-with-images.view-model';
import { BloggerBlogsWithImagesSubscribersViewModel } from '../../features/blogger-blogs/views/blogger-blogs-with-images-subscribers.view-model';

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
    | BloggerBlogsWithImagesViewModel
    | BloggerBlogsWithImagesSubscribersViewModel
  )[];
}
