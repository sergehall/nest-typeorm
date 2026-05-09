import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { StripeChargeObjectType } from '../../types/stripe-charge-object.type';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';
import { StripeEvent } from '../../types/stripe-sdk.types';

export class ProcessChargeSucceededCommand {
  constructor(public event: StripeEvent) {}
}

@CommandHandler(ProcessChargeSucceededCommand)
export class ProcessStripeChargeSucceededUseCase implements ICommandHandler<ProcessChargeSucceededCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: ProcessChargeSucceededCommand): Promise<string> {
    const { event } = command;
    try {
      const stripeChargeObject = event.data.object as unknown as StripeChargeObjectType;
      const receiptUrl = stripeChargeObject.receipt_url;
      if (receiptUrl) {
        // await this.paymentTransactionsRepo.saveReceiptUrl({
        //   paymentId: stripeChargeObject.id,
        //   receiptUrl,
        // });
      }

      return 'The purchase was successfully completed';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
