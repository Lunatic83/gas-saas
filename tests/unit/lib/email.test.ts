import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { sendEmail } from '@/lib/email/index';

const { nodemailerSend, resendSend } = vi.hoisted(() => ({
  nodemailerSend: vi.fn(),
  resendSend: vi.fn(),
}));

vi.mock('nodemailer', async () => {
  return {
    __esModule: true,
    default: {
      createTransport: vi.fn().mockReturnValue({
        sendMail: nodemailerSend,
      }),
    },
  };
});

vi.mock('resend', async () => {
  return {
    __esModule: true,
    Resend: class {
      emails = { send: resendSend };
    },
  };
});

describe('lib/email', () => {
  let origEmailProvider: string | undefined;
  let origResendApiKey: string | undefined;

  beforeEach(() => {
    origEmailProvider = process.env.EMAIL_PROVIDER;
    origResendApiKey = process.env.RESEND_API_KEY;
    vi.resetModules();
    nodemailerSend.mockResolvedValue({ messageId: 'test-id' });
    resendSend.mockResolvedValue({ data: { id: 'resend-id' } });
  });

  afterEach(() => {
    process.env.EMAIL_PROVIDER = origEmailProvider ?? '';
    process.env.RESEND_API_KEY = origResendApiKey ?? '';
  });

  describe('sendEmail', () => {
    test('returns null when EMAIL_PROVIDER is not configured', async () => {
      delete process.env.EMAIL_PROVIDER;
      delete process.env.RESEND_API_KEY;

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });
      expect(result).toBeNull();
    });

    test('routes to nodemailer Ethereal when EMAIL_PROVIDER=ethereal', async () => {
      process.env.EMAIL_PROVIDER = 'ethereal';
      delete process.env.RESEND_API_KEY;

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result).toEqual({ id: 'test-id' });
      expect(nodemailerSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        }),
      );
    });

    test('routes to Resend when EMAIL_PROVIDER=resend and RESEND_API_KEY is set', async () => {
      process.env.EMAIL_PROVIDER = 'resend';
      process.env.RESEND_API_KEY = 're_testkey123';

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result).toEqual({ id: 'resend-id' });
    });

    test('returns null when RESEND_API_KEY is missing with resend provider', async () => {
      process.env.EMAIL_PROVIDER = 'resend';
      delete process.env.RESEND_API_KEY;

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });
      expect(result).toBeNull();
    });

    test('returns null when EMAIL_PROVIDER is set to unknown value', async () => {
      process.env.EMAIL_PROVIDER = 'mailhog';
      delete process.env.RESEND_API_KEY;

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });
      expect(result).toBeNull();
    });
  });
});
