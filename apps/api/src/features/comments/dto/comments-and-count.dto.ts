import { CommentViewModel } from '../views/comment.view-model';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

export class CommentsAndCountDto {
  @ValidateNested({ each: true }) // Validates each item in the array
  @IsArray()
  comments: CommentViewModel[];

  @IsInt()
  countComments: number;
}
