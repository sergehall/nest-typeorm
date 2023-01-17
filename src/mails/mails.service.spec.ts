import { Test, TestingModule } from '@nestjs/testing';
import { MailsService } from './mails.service';

describe('MailService', () => {
  let service: MailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailsService],
    }).compile();

    service = module.get<MailsService>(MailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
