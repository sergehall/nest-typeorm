import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
} from 'class-validator';

export class ImagesPostsOriginalMetadataDTO {
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  pathKey: string;

  @IsNotEmpty()
  @IsString()
  eTag: string;

  @IsNotEmpty()
  @IsString()
  fieldName: string;

  @IsNotEmpty()
  @IsString()
  originalName: string;

  @IsNotEmpty()
  @IsString()
  encoding: string;

  @IsNotEmpty()
  @IsString()
  mimetype: string;

  buffer: Buffer;

  @IsNotEmpty()
  @IsInt()
  size: number;

  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @IsBoolean()
  @IsOptional()
  dependencyIsBanned?: boolean;

  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;

  @IsString()
  @IsOptional()
  banDate?: string | null;

  @IsString()
  @IsOptional()
  banReason?: string | null;

  @IsUUID()
  blogId: string;

  @IsString()
  blogName: string;

  @IsUUID()
  postId: string;

  @IsString()
  postTitle: string;

  @IsUUID()
  postOwnerId: string;
}
