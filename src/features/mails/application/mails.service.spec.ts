import { Test, TestingModule } from '@nestjs/testing';
import { MailsService } from './mails.service';
import { AppModule } from '../../../app.module';

describe('MailService', () => {
  let service: MailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<MailsService>(MailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
