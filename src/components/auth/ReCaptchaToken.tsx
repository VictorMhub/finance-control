'use client';

import Script from 'next/script';
import { useCallback } from 'react';

type Props = {
  action: string;
  onToken: (token: string) => void;
};

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

export function ReCaptchaToken({
  action,
  onToken
}: Props) {
  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const generateToken = useCallback(() => {
    if (!siteKey) {
      console.error(
        'RECAPTCHA: site key não encontrada.'
      );
      onToken('');
      return;
    }

    if (!window.grecaptcha) {
      console.error(
        'RECAPTCHA: grecaptcha não carregado.'
      );
      onToken('');
      return;
    }

    window.grecaptcha.ready(async () => {
      try {
        console.log(
          `Gerando token reCAPTCHA para: ${action}`
        );

        const token =
          await window.grecaptcha!.execute(
            siteKey,
            {
              action
            }
          );

        console.log(
          `Token reCAPTCHA gerado para: ${action}`
        );

        onToken(token);
      } catch (error) {
        console.error(
          'Erro ao gerar token reCAPTCHA:',
          error
        );

        onToken('');
      }
    });
  }, [action, onToken, siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <Script
      id="google-recaptcha-v3"
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
      onReady={generateToken}
      onError={(error) => {
        console.error(
          'Erro ao carregar reCAPTCHA:',
          error
        );

        onToken('');
      }}
    />
  );
}