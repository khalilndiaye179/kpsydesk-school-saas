import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer');

describe('MailService', () => {
  const sendMail = jest.fn();
  const createTransport = nodemailer.createTransport as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    createTransport.mockReturnValue({ sendMail });
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
  });

  it('uses implicit SSL on port 465', () => {
    new MailService();
    expect(createTransport.mock.calls[0][0]).toMatchObject({ port: 465, secure: true });
  });

  it('stays non-secure on port 587 unless SMTP_SECURE is set', () => {
    process.env.SMTP_PORT = '587';
    new MailService();
    expect(createTransport.mock.calls[0][0]).toMatchObject({ port: 587, secure: false });

    process.env.SMTP_SECURE = 'true';
    new MailService();
    expect(createTransport.mock.calls[1][0]).toMatchObject({ port: 587, secure: true });
  });

  it('sends the OTP email and returns true', async () => {
    sendMail.mockResolvedValue({ messageId: 'msg-1' });

    await expect(
      new MailService().sendOtpCode('awa@example.com', '123456', 'École Test'),
    ).resolves.toBe(true);

    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe('awa@example.com');
    expect(mail.subject).toContain('123456');
    expect(mail.html).toContain('École Test');
    expect(mail.html).toContain('123456');
  });

  it('returns false when the transport fails', async () => {
    sendMail.mockRejectedValue(new Error('smtp down'));
    await expect(
      new MailService().sendOtpCode('awa@example.com', '123456', 'École Test'),
    ).resolves.toBe(false);
  });
});
