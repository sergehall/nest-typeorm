import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvalidJwtEntity } from '../entities/invalid-jwt.entity';
import { InvalidJwtDto } from '../dto/invalid-jwt.dto';
import { InternalServerErrorException } from '@nestjs/common';

export class InvalidJwtRepo {
  constructor(
    @InjectRepository(InvalidJwtEntity)
    private readonly invalidJwtRepository: Repository<InvalidJwtEntity>,
  ) {}

  async addJwt(jwtBlacklistDto: InvalidJwtDto): Promise<boolean> {
    try {
      const invalidJwtEntity = this.invalidJwtRepository.create({
        refreshToken: jwtBlacklistDto.refreshToken,
        expirationDate: jwtBlacklistDto.expirationDate,
      });

      const result = await this.invalidJwtRepository.save(invalidJwtEntity);
      return !!result.id;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async JwtExistInBlackList(jwt: string): Promise<boolean> {
    try {
      const findJwt = await this.invalidJwtRepository.findOne({
        where: {
          refreshToken: jwt,
        },
      });
      return !!findJwt;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
