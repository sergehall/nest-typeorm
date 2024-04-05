import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';

export class ProcessStripeSuccessCommand {
  constructor() {}
}

@CommandHandler(ProcessStripeSuccessCommand)
export class ProcessStripeSuccessUseCase
  implements ICommandHandler<ProcessStripeSuccessCommand>
{
  constructor() {}

  async execute(command: ProcessStripeSuccessCommand): Promise<string> {
    const {} = command;

    try {
      switch ('success') {
        case 'success':
          // Do something with event or another logic
          break;
        default:
          // Handle others
          break;
      }

      return 'The purchase was successfully completed';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
