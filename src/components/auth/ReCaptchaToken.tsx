'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

type Props = {
  action: 'login' | 'register';
  onToken(token: string): void;
};

export function ReCaptchaToken({ action, onToken }: Props) {
  const [ready, setReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
    return () => script.remove();
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey || !ready || !window.grecaptcha) return;
    window.grecaptcha.ready(() => {
      window.grecaptcha?.execute(siteKey, { action }).then(onToken).catch(() => onToken(''));
    });
  }, [action, onToken, ready, siteKey]);

  return null;
}
