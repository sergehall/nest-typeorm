import { ProvidersEnums } from '../../infrastructure/database/enums/providers.enums';
import { ConnectionEnums } from '../../infrastructure/database/enums/connection.enums';
import { Mongoose } from 'mongoose';
import { NamesCollectionsEnums } from '../../infrastructure/database/enums/names-collections.enums';
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
    inject: [ConnectionEnums.ASYNC_CONNECTION],
  },
];
