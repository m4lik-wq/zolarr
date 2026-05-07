import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = 'test-key';
  process.env.RESEND_FROM_EMAIL = 'noreply@test.dev';
  vi.resetModules();
});

describe('sendEmail', () => {
  it('returns ok:true when Resend succeeds', async () => {
    sendMock.mockResolvedValueOnce({ data: { id: 'msg_123' }, error: null });
    const { sendEmail } = await import('@/lib/email/send');
    const result = await sendEmail({
      to: 'foo@example.com',
      subject: 'Test',
      html: '<p>hi</p>',
    });
    expect(result).toEqual({ ok: true, id: 'msg_123' });
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
      from: 'noreply@test.dev',
      to: 'foo@example.com',
      subject: 'Test',
      html: '<p>hi</p>',
    }));
  });

  it('returns ok:false and logs when Resend errors', async () => {
    sendMock.mockResolvedValueOnce({ data: null, error: { message: 'rate limit', name: 'rate_limit_exceeded' } });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { sendEmail } = await import('@/lib/email/send');
    const result = await sendEmail({ to: 'foo@example.com', subject: 'Test', html: '<p>hi</p>' });
    expect(result.ok).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('returns ok:false when RESEND_API_KEY missing', async () => {
    delete process.env.RESEND_API_KEY;
    vi.resetModules();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { sendEmail } = await import('@/lib/email/send');
    const result = await sendEmail({ to: 'foo@example.com', subject: 'Test', html: '<p>hi</p>' });
    expect(result.ok).toBe(false);
    errorSpy.mockRestore();
  });
});
