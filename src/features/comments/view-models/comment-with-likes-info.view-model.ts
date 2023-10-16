import {
  IsEnum,
  IsInt,
  IsObject,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';

class CommentatorInfo {
  @IsUUID()
  userId: string;

  @IsString()
  userLogin: string;
}

class LikesInfo {
  @IsInt()
  likesCount: number;

  @IsInt()
  dislikesCount: number;

  @IsEnum(LikeStatusEnums, {
    message: 'Incorrect myStatus must be type of Like, Dislike or None.',
  })
  myStatus: LikeStatusEnums;
}

export class CommentWithLikesInfoViewModel {
  @IsString()
  id: string;

  @IsString()
  content: string;

  @IsString()
  createdAt: string;

  @IsObject()
  @ValidateNested()
  commentatorInfo: CommentatorInfo;

  @IsObject()
  @ValidateNested()
  likesInfo: LikesInfo;
}
