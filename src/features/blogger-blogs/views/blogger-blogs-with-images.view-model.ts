import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  Length,
  Matches,
} from 'class-validator';

export class Image {
  @IsNotEmpty()
  url: string = '';

  @IsNotEmpty()
  @IsNumber()
  width: number = 0;

  @IsNotEmpty()
  @IsNumber()
  height: number = 0;

  @IsNotEmpty()
  @IsNumber()
  fileSize: number = 0;
}

export class ImagesViewModel {
  wallpaper: Image | null = null;
  main: Image[] = [];
}

export class BloggerBlogsWithImagesViewModel {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 15 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(0, 15, {
    message: 'Incorrect name! Must be max 15 ch.',
  })
  name: string;
  @IsNotEmpty()
  @Length(0, 500, {
    message: 'Incorrect description! Must be max 500 ch.',
  })
  description: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect websiteUrl length! Must be max 100 ch.',
  })
  @Matches(
    '^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  )
  websiteUrl: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect createdAt length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
  @IsNotEmpty()
  @IsBoolean()
  isMembership: boolean;
  images: ImagesViewModel;
}
