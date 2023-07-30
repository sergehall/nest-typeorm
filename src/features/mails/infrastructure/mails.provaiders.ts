import { ProvidersEnums } from '../../../config/db/mongo/enums/providers.enums';
import { ConnectionEnums } from '../../../config/db/mongo/enums/connection.enums';
import { Mongoose } from 'mongoose';
import { NamesCollectionsEnums } from '../../../config/db/mongo/enums/names-collections.enums';
import {
  EmailsConfirmCodeDocument,
  EmailsConfirmCodeSchema,
} from './schemas/email-confirm-code.schema';

export const mailsProviders = [
  {
    provide: ProvidersEnums.CONFIRM_CODE_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<EmailsConfirmCodeDocument>(
        'EmailsConfirmCodes',
        EmailsConfirmCodeSchema,
        NamesCollectionsEnums.EMAILS_CONFIRM_CODES,
      ),
    inject: [ConnectionEnums.ASYNC_ATLAS_CONNECTION],
  },
];
