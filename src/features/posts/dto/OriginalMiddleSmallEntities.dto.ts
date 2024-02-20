import { IsDefined } from 'class-validator';
import { ImagesPostsOriginalMetadataEntity } from '../entities/images-post-original-metadata.entity';
import { ImagesPostMiddleMetadataEntity } from '../entities/images-post-middle-metadata.entity';
import { ImagesPostSmallMetadataEntity } from '../entities/images-post-small-metadata.entity';

export class OriginalMiddleSmallEntitiesDto {
  @IsDefined({ message: 'Fieldname is required' })
  original: ImagesPostsOriginalMetadataEntity;
  @IsDefined({ message: 'Fieldname is required' })
  middle: ImagesPostMiddleMetadataEntity;
  @IsDefined({ message: 'Fieldname is required' })
  small: ImagesPostSmallMetadataEntity;
}
