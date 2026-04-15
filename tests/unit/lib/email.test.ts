import { resolve } from 'path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const root = resolve(__dirname, '../../..');

const mockSendEthreal = vi.fn();
const mockSendResend = vi.fn();

vi.mock('nodemailer', async () => {
  return {
    __esModule: true,
    default: {
      createTransport: vi.fn().mockReturnValue({ sendMail: mockSendEthreal }),
    },
  };
});

vi.mock('resend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('resend')>();
  return {
    ...actual,
    Resend: class {
      constructor() {}
      emails = { send: mockSendResend };
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
    mockSendEthreal.mockReset().mockResolvedValue({ messageId: 'test-id' });
    mockSendResend.mockReset().mockResolvedValue({ data: { id: 'resend-id' } });
  });

  afterEach(() => {
    process.env.EMAIL_PROVIDER = origEmailProvider ?? '';
    process.env.RESEND_API_KEY = origResendApiKey ?? '';
  });

  describe('sendEmail', () => {
    test('returns null when EMAIL_PROVIDER is not configured', async () => {
      delete process.env.EMAIL_PROVIDER;
      delete process.env.RESEND_API_KEY;

      const { sendEmail } = await import(`${root}/lib/email/index.ts`);
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

      const { sendEmail } = await import(`${root}/lib/email/index.ts`);
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result).toEqual({ id: 'test-id' });
      expect(mockSendEthreal).toHaveBeenCalledWith(
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

      const { sendEmail } = await import(`${root}/lib/email/index.ts`);
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result).toEqual({ id: 'resend-id' });
      expect(mockSendResend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        }),
      );
    });

    test('returns null when RESEND_API_KEY is missing with resend provider', async () => {
      process.env.EMAIL_PROVIDER = 'resend';
      delete process.env.RESEND_API_KEY;

      const { sendEmail } = await import(`${root}/lib/email/index.ts`);
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });
      expect(result).toBeNull();
    });
  });
});
