import type { DefaultSession, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyCaptcha } from '@/lib/security';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8
  },
  pages: {
    signIn: '/login'
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: 'Email e senha',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
        captchaToken: { label: 'CAPTCHA', type: 'text' }
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const ip = req.headers?.['x-forwarded-for']?.toString().split(',')[0] ?? 'unknown';
        const allowed = checkRateLimit(`login:${ip}:${parsed.data.email}`, 5, 60_000);
        if (!allowed) return null;

        const captchaOk = await verifyCaptcha(parsed.data.captchaToken, ip);
        if (!captchaOk) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user) return null;

        const validPassword = await compare(parsed.data.password, user.passwordHash);
        if (!validPassword) return null;

        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id;
      return session;
    }
  }
};
