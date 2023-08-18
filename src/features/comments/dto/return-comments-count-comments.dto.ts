import { ReturnCommentsEntity } from '../entities/return-comments.entity';

export class ReturnCommentsCountCommentsDto {
  comments: ReturnCommentsEntity[];
  countComments: number;
}
