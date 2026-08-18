import { headers } from 'next/headers';

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, '').trim();
}

export async function verifyCaptcha(token: string, remoteIp?: string) {
  if (process.env.NODE_ENV === 'test') return token === 'test-captcha';

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean; score?: number };
  return Boolean(result.success && (result.score === undefined || result.score >= 0.5));
}

export function assertSameOrigin() {
  const headerStore = headers();
  const origin = headerStore.get('origin');
  const host = headerStore.get('host');

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
