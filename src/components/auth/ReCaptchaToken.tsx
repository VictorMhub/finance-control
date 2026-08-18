'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

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
    console.log('RECAPTCHA SITE KEY:', siteKey);

  const [scriptLoaded, setScriptLoaded] =
    useState(false);

  const generateToken = useCallback(() => {
    if (!siteKey) {
      console.error(
        'NEXT_PUBLIC_RECAPTCHA_SITE_KEY não configurada.'
      );

      onToken('');
      return;
    }

    if (!window.grecaptcha) {
      console.error(
        'grecaptcha ainda não está disponível.'
      );

      onToken('');
      return;
    }

    window.grecaptcha.ready(async () => {
      try {
        console.log(
          'Gerando token reCAPTCHA...',
          action
        );

        const token =
          await window.grecaptcha!.execute(
            siteKey,
            {
              action
            }
          );

        console.log(
          'TOKEN RECAPTCHA GERADO:',
          token
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

  useEffect(() => {
    if (!scriptLoaded) return;

    generateToken();
  }, [scriptLoaded, generateToken]);

  if (!siteKey) {
    console.error(
      'RECAPTCHA: site key não encontrada.'
    );

    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
      onLoad={() => {
        console.log(
          'Script do reCAPTCHA carregado.'
        );

        setScriptLoaded(true);
      }}
      onError={(error) => {
        console.error(
          'Erro ao carregar script reCAPTCHA:',
          error
        );

        onToken('');
      }}
    />
  );
}