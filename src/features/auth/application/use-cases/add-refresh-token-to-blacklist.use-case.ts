import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadDto } from '../../dto/payload.dto';
import { InvalidJwtDto } from '../../dto/invalid-jwt.dto';
import { InvalidJwtRepo } from '../../infrastructure/invalid-jwt-repo';

export class AddInvalidJwtToBlacklistCommand {
  constructor(
    public refreshToken: string,
    public currentPayload: PayloadDto,
  ) {}
}
@CommandHandler(AddInvalidJwtToBlacklistCommand)
export class AddInvalidJwtToBlacklistUseCase
  implements ICommandHandler<AddInvalidJwtToBlacklistCommand>
{
  constructor(private invalidJwtRepo: InvalidJwtRepo) {}
  async execute(command: AddInvalidJwtToBlacklistCommand): Promise<boolean> {
    const { refreshToken, currentPayload } = command;

    const refreshTokenToBlackList: InvalidJwtDto = {
      refreshToken: refreshToken,
      expirationDate: new Date(currentPayload.exp * 1000).toISOString(),
    };

    return await this.invalidJwtRepo.addJwt(refreshTokenToBlackList);
  }
}
