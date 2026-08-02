import { MailController } from './mail.controller';

describe('MailController', () => {
  const mailService = { sendOtpCode: jest.fn() };
  const controller = new MailController(mailService as any);

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
    delete process.env.SMTP_PASS;
  });

  it('reports SUCCESS with the effective SMTP config and never leaks the password', async () => {
    mailService.sendOtpCode.mockResolvedValue(true);
    process.env.SMTP_PASS = 'secret';

    const result = await controller.testSmtp('awa@example.com');

    expect(result.status).toBe('SUCCESS');
    expect(result.config).toMatchObject({
      port: 465,
      isSecure: true,
      hasPasswordConfigured: true,
      sentTo: 'awa@example.com',
    });
    expect(JSON.stringify(result)).not.toContain('secret');
    expect(mailService.sendOtpCode).toHaveBeenCalledWith(
      'awa@example.com',
      expect.stringMatching(/^\d{6}$/),
      'Établissement Test KPSyDesk',
    );
  });

  it('falls back to the support address and reports FAILED when sending fails', async () => {
    mailService.sendOtpCode.mockResolvedValue(false);

    const result = await controller.testSmtp();

    expect(result.status).toBe('FAILED');
    expect(result.config.sentTo).toBe('kpsydesk.support@kpsyinformatique.com');
    expect(result.config.hasPasswordConfigured).toBe(false);
  });
});
