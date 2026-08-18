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

type Props = {
  mode: 'login' | 'register';
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegister = mode === 'register';
  const handleCaptcha = useCallback((token: string) => setCaptchaToken(token), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      monthlyIncome: Number(form.get('monthlyIncome') ?? 0),
      captchaToken
    };

    if (isRegister) {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'Não foi possível criar sua conta.');
        setLoading(false);
        return;
      }
    }

    const result = await signIn('credentials', {
      email: payload.email,
      password: payload.password,
      captchaToken,
      redirect: false
    });

    setLoading(false);
    if (result?.ok) router.push('/dashboard');
    else setError('Email, senha ou CAPTCHA inválidos.');
  }

  return (
    <Box minH="100vh" bg="gray.50" px={4} py={8} display="grid" placeItems="center">
      <Box as="main" bg="white" w="full" maxW="md" p={6} borderRadius="2xl" boxShadow="lg">
        <Stack spacing={6}>
          <Stack spacing={2}>
            <Heading size="lg">{isRegister ? 'Criar conta' : 'Entrar'}</Heading>
            <Text color="gray.600">Controle seus gastos com segurança e clareza.</Text>
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
                <Input id="email" name="email" type="email" autoComplete="email" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor="password">Senha</FormLabel>
                <Input id="password" name="password" type="password" minLength={8} autoComplete={isRegister ? 'new-password' : 'current-password'} />
              </FormControl>
              {isRegister && (
                <FormControl>
                  <FormLabel htmlFor="monthlyIncome">Renda mensal</FormLabel>
                  <Input id="monthlyIncome" name="monthlyIncome" type="number" min={0} step="0.01" defaultValue="0" />
                </FormControl>
              )}
              <input name="captchaToken" type="hidden" value={captchaToken} readOnly />
              <ReCaptchaToken action={mode} onToken={handleCaptcha} />
              <Text fontSize="xs" color="gray.500">Este formulário usa reCAPTCHA para prevenir credential stuffing.</Text>
              <Button type="submit" isLoading={loading} w="full">
                {isRegister ? 'Cadastrar' : 'Entrar'}
              </Button>
            </Stack>
          </form>

          <Text fontSize="sm" color="gray.600">
            {isRegister ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
            <Link as={NextLink} color="brand.600" href={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Entrar' : 'Criar conta'}
            </Link>
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
