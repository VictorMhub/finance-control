# Changelog

## Etapa 1 — Setup e Configuração
- Criado projeto Next.js com TypeScript estrito, App Router e estrutura solicitada.
- Configurados Chakra UI, Jest, React Testing Library, ESLint, Prettier, Prisma e CI GitHub Actions.
- Criados `.env.example`, `.gitignore`, docs iniciais e scripts de build/test/deploy.

## Etapa 2 — Autenticação e Segurança
- Implementados login e cadastro mobile-first.
- Configurado NextAuth Credentials com cookies HTTPOnly/Secure/SameSite.
- Adicionados CAPTCHA, rate limit, bcrypt, Zod, sanitização textual e headers de segurança.

## Etapa 3 — Dashboard e Transações
- Criado layout protegido com bottom navigation mobile.
- Implementado dashboard com balanço diário, receitas/despesas mensais, saldo, gráfico e listas.
- Implementado CRUD de transações e categorias padrão.

## Etapa 4 — Metas Financeiras
- Criado formulário e listagem de metas.
- Implementados cálculos de progresso, meses necessários e dificuldade.

## Etapa 5 — Polish e Deploy
- Adicionados testes unitários/componentes e documentação de setup, arquitetura, segurança e API.
- Configurado workflow de CI com lint, cobertura e build.
