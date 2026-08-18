# Segurança

## Medidas implementadas
- Sessão NextAuth em cookies HTTPOnly, Secure em produção e SameSite=Strict.
- Nenhum token/sessão é armazenado em `localStorage` ou `sessionStorage`.
- Hash de senhas com bcrypt (`bcryptjs`) usando custo 12.
- CAPTCHA no login e cadastro via reCAPTCHA.
- Rate limiting em memória para login e cadastro.
- Validação de inputs com Zod em auth, categorias, transações e metas.
- Sanitização simples de campos textuais removendo `<` e `>` antes de persistir.
- Validação de origem em mutações para reduzir risco CSRF.
- CSRF do NextAuth nos fluxos de autenticação.
- Headers CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy e Permissions-Policy em `next.config.js`.
- `.env.local` ignorado no Git.

## CAPTCHA
O cliente carrega `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` e envia `captchaToken` no login/cadastro. O servidor valida com `RECAPTCHA_SECRET_KEY` no endpoint oficial do reCAPTCHA.

## Cookies e tokens
A sessão usa estratégia JWT interna do NextAuth, armazenada somente em cookie HTTPOnly. Em produção, o cookie recebe prefixo seguro e `secure: true`.

## Checklist
- XSS: Chakra escapa conteúdo, inputs textuais são sanitizados e CSP está configurada.
- CSRF: SameSite=Strict, validação de origem em mutações e CSRF do NextAuth.
- Credential stuffing: CAPTCHA e rate limit.
- Segredos: somente variáveis de ambiente.
- Validação: Zod em todas as APIs.

## Observação para produção serverless
O rate limit em memória é suficiente para desenvolvimento. Em Vercel serverless, substitua por store compartilhado como Upstash Redis.
