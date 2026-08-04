import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../src/mail/mail.service';

describe('MailService OTP Resilience', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should return true in fallback mode when SMTP_PASS is missing', async () => {
    delete process.env.SMTP_PASS;
    const result = await service.sendOtpCode('test@kpsyschool.com', '123456', 'École Test');
    expect(result).toBe(true);
  });
});
