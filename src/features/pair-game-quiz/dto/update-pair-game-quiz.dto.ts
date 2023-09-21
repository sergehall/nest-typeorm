import { PartialType } from '@nestjs/mapped-types';
import { CreatePairGameQuizDto } from './create-pair-game-quiz.dto';

export class UpdatePairGameQuizDto extends PartialType(CreatePairGameQuizDto) {}
