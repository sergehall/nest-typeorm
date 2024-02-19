import { PostWithLikesInfoViewModel } from './post-with-likes-info.view-model';
import { PostImagesViewModel } from '../../blogger-blogs/views/post-images.view-model';

export class PostWithLikesImagesInfoViewModel extends PostWithLikesInfoViewModel {
  images: PostImagesViewModel;
}
