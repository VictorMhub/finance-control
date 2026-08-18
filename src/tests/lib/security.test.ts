import { headers } from 'next/headers';
import { resetRateLimit, checkRateLimit } from '@/lib/rate-limit';
import { categorySchema, goalSchema, loginSchema, registerSchema, transactionSchema } from '@/lib/schemas';
import { assertSameOrigin, sanitizeText, verifyCaptcha } from '@/lib/security';

jest.mock('next/headers', () => ({ headers: jest.fn() }));

function setNodeEnv(value: string) {
  Object.defineProperty(process.env, 'NODE_ENV', { value, configurable: true });
}

describe('rate limiting', () => {
  beforeEach(() => resetRateLimit());

  it('allows requests until the configured limit', () => {
    expect(checkRateLimit('login:test', 2, 60_000)).toBe(true);
    expect(checkRateLimit('login:test', 2, 60_000)).toBe(true);
    expect(checkRateLimit('login:test', 2, 60_000)).toBe(false);
  });
});

describe('schemas', () => {
  it('normalizes and validates auth payloads', () => {
    expect(loginSchema.parse({ email: 'MARIA@EXAMPLE.COM', password: 'password123', captchaToken: 'token' }).email).toBe('maria@example.com');
    expect(registerSchema.parse({ name: 'Maria', email: 'maria@example.com', password: 'password123', captchaToken: 'token' }).monthlyIncome).toBe(0);
  });

  it('validates finance payloads', () => {
    expect(categorySchema.parse({ name: 'Mercado', color: '#123abc', type: 'EXPENSE' }).type).toBe('EXPENSE');
    expect(transactionSchema.parse({
      amount: '120.50',
      description: 'Mercado',
      date: '2026-08-18',
      type: 'EXPENSE',
      categoryId: 'cmek123456789012345678901',
      isFixed: true
    }).amount).toBe(120.5);
    expect(goalSchema.parse({
      title: 'Reserva',
      targetAmount: 10000,
      savedAmount: 1000,
      monthlyContribution: 500,
      monthlyIncome: 5000
    }).title).toBe('Reserva');
  });
});

describe('security helpers', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecret = process.env.RECAPTCHA_SECRET_KEY;

  afterEach(() => {
    setNodeEnv(originalNodeEnv);
    process.env.RECAPTCHA_SECRET_KEY = originalSecret;
    jest.restoreAllMocks();
  });

  it('sanitizes user-facing text', () => {
    expect(sanitizeText(' <script>Maria</script> ')).toBe('scriptMaria/script');
  });

  it('accepts the test captcha token in tests', async () => {
    await expect(verifyCaptcha('test-captcha')).resolves.toBe(true);
    await expect(verifyCaptcha('wrong-token')).resolves.toBe(false);
  });

  it('rejects captcha without production secret or token', async () => {
    setNodeEnv('production');
    delete process.env.RECAPTCHA_SECRET_KEY;

    await expect(verifyCaptcha('token')).resolves.toBe(false);
    process.env.RECAPTCHA_SECRET_KEY = 'secret';
    await expect(verifyCaptcha('')).resolves.toBe(false);
  });

  it('verifies production captcha responses', async () => {
    setNodeEnv('production');
    process.env.RECAPTCHA_SECRET_KEY = 'secret';
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, score: 0.8 }) });

    await expect(verifyCaptcha('token', '127.0.0.1')).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://www.google.com/recaptcha/api/siteverify', expect.objectContaining({ method: 'POST' }));
  });

  it('rejects failed captcha responses', async () => {
    setNodeEnv('production');
    process.env.RECAPTCHA_SECRET_KEY = 'secret';
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, score: 0.1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: false }) });

    await expect(verifyCaptcha('token')).resolves.toBe(false);
    await expect(verifyCaptcha('token')).resolves.toBe(false);
    await expect(verifyCaptcha('token')).resolves.toBe(false);
  });

  it('checks request origin against host', () => {
    const headersMock = headers as jest.Mock;
    headersMock.mockReturnValueOnce({ get: (key: string) => (key === 'origin' ? 'https://app.example.com' : 'app.example.com') });
    expect(assertSameOrigin()).toBe(true);

    headersMock.mockReturnValueOnce({ get: (key: string) => (key === 'origin' ? 'https://evil.example.com' : 'app.example.com') });
    expect(assertSameOrigin()).toBe(false);

    headersMock.mockReturnValueOnce({ get: () => null });
    expect(assertSameOrigin()).toBe(true);

    headersMock.mockReturnValueOnce({ get: (key: string) => (key === 'origin' ? 'not a url' : 'app.example.com') });
    expect(assertSameOrigin()).toBe(false);
  });
});
