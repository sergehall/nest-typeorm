import { IsDefined } from 'class-validator';
import { ImagesPostsOriginalMetadataEntity } from '../entities/images-post-original-metadata.entity';
import { ImagesPostsMiddleMetadataEntity } from '../entities/images-posts-middle-metadata.entity';
import { ImagesPostsSmallMetadataEntity } from '../entities/images-posts-small-metadata.entity';

export class OriginalMiddleSmallEntitiesDto {
  @IsDefined({ message: 'Fieldname is required' })
  original: ImagesPostsOriginalMetadataEntity;
  @IsDefined({ message: 'Fieldname is required' })
  middle: ImagesPostsMiddleMetadataEntity;
  @IsDefined({ message: 'Fieldname is required' })
  small: ImagesPostsSmallMetadataEntity;
}
