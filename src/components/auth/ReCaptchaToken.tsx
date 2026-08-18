'use client';

import Script from 'next/script';

const siteKey =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function ReCaptchaToken() {
  if (!siteKey) {
    console.error(
      'RECAPTCHA: site key não encontrada.'
    );

    return null;
  }

  return (
    <Script
      id="google-recaptcha-v3"
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
      onReady={() => {
        console.log('reCAPTCHA pronto.');
      }}
    />
  );
}