'use client';

import { useCallback, useState } from 'react';
import NextLink from 'next/link';
import { signIn } from 'next-auth/react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ReCaptchaToken } from './ReCaptchaToken';

type CaptchaProps = {
  action: 'login' | 'register';
  onToken: (token: string) => void;
};

const CaptchaGate = ReCaptchaToken as React.ComponentType<CaptchaProps>;

type Props = {
  mode: 'login' | 'register';
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

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegister = mode === 'register';
  const handleCaptcha = useCallback(
  (token: string) => {

    setCaptchaToken(token);
  },
  []
);

async function generateCaptchaToken(
  action: string
): Promise<string> {
  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    throw new Error(
      'Site key do reCAPTCHA não configurada.'
    );
  }

  if (!window.grecaptcha) {
    throw new Error(
      'reCAPTCHA ainda não carregado.'
    );
  }

  return new Promise((resolve, reject) => {
    window.grecaptcha!.ready(async () => {
      try {
        const token =
          await window.grecaptcha!.execute(
            siteKey,
            { action }
          );

        resolve(token);
      } catch (error) {
        reject(error);
      }
    });
  });
}

 async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setLoading(true);
  setError('');

  try {
    const captchaToken =
      await generateCaptchaToken(mode);

    console.log(
      'Novo token CAPTCHA gerado:',
      Boolean(captchaToken)
    );

    const form =
      new FormData(event.currentTarget);

    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(
        form.get('password') ?? ''
      ),
      monthlyIncome: Number(
        form.get('monthlyIncome') ?? 0
      ),
      captchaToken
    };

    if (isRegister) {
      const response = await fetch(
        '/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const body =
          (await response
            .json()
            .catch(() => ({}))) as {
            error?: string;
          };

        setError(
          body.error ??
            'Não foi possível criar sua conta.'
        );

        setLoading(false);
        return;
      }
    }

    const result = await signIn(
      'credentials',
      {
        email: payload.email,
        password: payload.password,
        captchaToken,
        redirect: false
      }
    );

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      setError(
        'Email, senha ou CAPTCHA inválidos.'
      );
    }
  } catch (error) {
    console.error(
      'Erro ao gerar CAPTCHA:',
      error
    );

    setError(
      'Não foi possível realizar a validação de segurança. Tente novamente.'
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      px={4}
      py={8}
      display="grid"
      placeItems="center"
    >
      <Box
        as="main"
        bg="white"
        w="full"
        maxW="md"
        p={6}
        borderRadius="2xl"
        boxShadow="lg"
      >
        <Stack spacing={6}>
          <Stack spacing={2}>
            <Heading size="lg">{isRegister ? 'Criar conta' : 'Entrar'}</Heading>
            <Text color="gray.600">
              Controle seus gastos com segurança e clareza.
            </Text>
          </Stack>

          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {isRegister && (
                <FormControl isRequired>
                  <FormLabel htmlFor="name">Nome</FormLabel>
                  <Input id="name" name="name" autoComplete="name" />
                </FormControl>
              )}
              <FormControl isRequired>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu.email@exemplo.com"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor="password">Senha</FormLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  autoComplete={
                    isRegister ? 'new-password' : 'current-password'
                  }
                />
              </FormControl>
              {isRegister && (
                <FormControl>
                  <FormLabel htmlFor="monthlyIncome">Renda mensal</FormLabel>
                  <Input
                    id="monthlyIncome"
                    name="monthlyIncome"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                  />
                </FormControl>
              )}
              <input
                name="captchaToken"
                type="hidden"
                value={captchaToken}
                readOnly
              />
              <ReCaptchaToken />
              <Text fontSize="xs" color="gray.500">
                Este formulário usa reCAPTCHA para prevenir credential stuffing.
              </Text>
              <Button type="submit" isLoading={loading} w="full">
                {isRegister ? 'Cadastrar' : 'Entrar'}
              </Button>
            </Stack>
          </form>

          <Text fontSize="sm" color="gray.600">
            {isRegister ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
            <Link
              as={NextLink}
              color="brand.600"
              href={isRegister ? '/login' : '/register'}
            >
              {isRegister ? 'Entrar' : 'Criar conta'}
            </Link>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
