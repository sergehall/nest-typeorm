// import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { EmailsConfirmCodeEntity } from '../../entities/emails-confirm-code.entity';
// import { MailsRawSqlRepository } from '../../infrastructure/mails-raw-sql.repository';
// import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../infrastructure/sent-email-confirmation-code-time.repository';
// import { MailerRegistrationCodesCommand } from './send-registration-codes.use-case';
//
// export class FindAndSendConfirmationCommand {}
//
// @CommandHandler(FindAndSendConfirmationCommand)
// export class FindAndSendConfirmationCodeUseCase
//   implements ICommandHandler<FindAndSendConfirmationCommand>
// {
//   constructor(
//     protected mailsRawSqlRepository: MailsRawSqlRepository,
//     protected sentEmailsTimeRepository: SentEmailsTimeConfirmAndRecoverCodesRepository,
//     protected commandBus: CommandBus,
//   ) {}
//
//   async execute(): Promise<void> {
//     const emailAndCode: EmailsConfirmCodeEntity | null =
//       await this.mailsRawSqlRepository.findOldestConfCode();
//
//     if (emailAndCode) {
//       await this.commandBus.execute(
//         new MailerRegistrationCodesCommand(emailAndCode),
//       );
//
//       const { codeId, email } = emailAndCode;
//       await this.sentEmailsTimeRepository.addConfirmationCode(codeId, email);
//       await this.mailsRawSqlRepository.updateConfirmationCodesStatusToSent(
//         codeId,
//       );
//     }
//   }
// }
