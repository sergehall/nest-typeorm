import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { InvalidJwtEntity } from '../entities/invalid-jwt.entity';
import { InvalidJwtDto } from '../dto/invalid-jwt.dto';
import { InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

export class InvalidJwtRepo {
  constructor(
    @InjectRepository(InvalidJwtEntity)
    private readonly invalidJwtRepository: Repository<InvalidJwtEntity>,
  ) {}

  async addJwt(jwtBlacklistDto: InvalidJwtDto): Promise<boolean> {
    const { refreshToken, expirationDate } = jwtBlacklistDto;
    try {
      const invalidJwtEntity = this.invalidJwtRepository.create({
        hashedRefreshToken: await this.hashRefreshToken(refreshToken),
        expirationDate: expirationDate,
      });

      const result: InvalidJwtEntity =
        await this.invalidJwtRepository.save(invalidJwtEntity);

      return !!result.id;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async jwtExistInBlackList(jwt: string): Promise<boolean> {
    try {
      const findJwt: InvalidJwtEntity | null =
        await this.invalidJwtRepository.findOne({
          where: {
            hashedRefreshToken: await this.hashRefreshToken(jwt),
          },
        });
      return !!findJwt;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async clearingExpiredJwt(): Promise<void> {
    try {
      const currentTime = new Date().toISOString();
      await this.invalidJwtRepository.delete({
        expirationDate: LessThan(currentTime),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // Hash the refresh token before saving
  private async hashRefreshToken(refreshToken: string): Promise<string> {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
  }
}
