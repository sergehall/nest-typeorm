import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsNotEmpty, Length } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect id length! Must be max 50 ch.',
  })
  id: string;
}