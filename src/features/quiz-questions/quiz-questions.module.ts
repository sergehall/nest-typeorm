import { Module } from '@nestjs/common';
import { QuizQuestionsService } from './application/quiz-questions.service';
import { QuizQuestionsController } from './api/quiz-questions.controller';
import { SaCreateSuperAdmin } from '../sa/application/use-cases/sa-create-super-admin.use-case';
import { ExpirationDateCalculator } from '../../common/helpers/expiration-date-calculator';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { CaslModule } from '../../ability/casl.module';
import { CqrsModule } from '@nestjs/cqrs';
import { EncryptConfig } from '../../config/encrypt/encrypt-config';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), CaslModule, CqrsModule],
  controllers: [QuizQuestionsController],
  providers: [
    QuizQuestionsService,
    UsersRepo,
    SaCreateSuperAdmin,
    ExpirationDateCalculator,
    EncryptConfig,
    KeyResolver,
  ],
})
export class QuizQuestionsModule {}
