import { IsNotEmpty, IsNumber } from 'class-validator';
import { BloggerBlogsViewModel } from './blogger-blogs.view-model';

class Image {
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

export class Images {
  wallpaper: Image | null = null;
  main: Image[] = [new Image()];
}

export class BloggerBlogsWithImagesViewModel extends BloggerBlogsViewModel {
  images: Images;
}
