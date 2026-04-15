import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  id: string;
}

const provider = process.env.EMAIL_PROVIDER ?? '';

function createEtherealTransport() {
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: '',
    },
  });
}

function createResendTransport() {
  return new Resend(process.env.RESEND_API_KEY ?? '');
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult | null> {
  if (provider === 'ethereal') {
    const transport = createEtherealTransport();
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM ?? 'noreply@localhost',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { id: info.messageId };
  }

  if (provider === 'resend') {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[email] RESEND_API_KEY not set, skipping email send');
      return null;
    }
    const resend = createResendTransport();
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@localhost',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { id: result.data?.id ?? 'unknown' };
  }

  console.warn('[email] EMAIL_PROVIDER not configured, email not sent');
  return null;
}
