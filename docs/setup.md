# Setup

## Pré-requisitos
- Node.js 20+
- npm 10+
- PostgreSQL 16+
- Git
- Conta Vercel e GitHub para deploy automático

## Instalação
```bash
cd finance-control
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

A aplicação abre em `http://localhost:3000`.

## Variáveis de ambiente
Configure em `.env.local` e na Vercel:
- `NEXTAUTH_URL`: URL pública da aplicação.
- `NEXTAUTH_SECRET`: segredo forte para assinar cookies/tokens internos do NextAuth.
- `DATABASE_URL`: conexão PostgreSQL.
- `RECAPTCHA_SECRET_KEY`: chave privada do Google reCAPTCHA.
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`: chave pública do reCAPTCHA.

Nunca commite `.env.local`.

## Scripts
```bash
npm run dev
npm run lint
npm run test:coverage
npm run build
npm run deploy
```

## Vercel
```bash
npm i -g vercel
vercel login
vercel link
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add DATABASE_URL
vercel env add RECAPTCHA_SECRET_KEY
vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY
vercel --prod
```

Após importar o repositório GitHub na Vercel, cada push em `main` dispara deploy de produção e cada PR gera preview deploy.
