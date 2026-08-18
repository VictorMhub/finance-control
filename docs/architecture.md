# Arquitetura

## Visão geral
```text
Browser mobile-first
  -> Next.js App Router
    -> Server Components para leitura inicial
    -> Client Components para formulários, filtros e toasts
  -> API Routes protegidas por sessão NextAuth
    -> Zod valida payloads
    -> Prisma acessa PostgreSQL
```

## Decisões técnicas
- **Next.js 14 App Router**: rotas por arquivo, server rendering e bom caminho para deploy na Vercel.
- **React 18**: base exigida e compatível com Chakra UI.
- **Chakra UI v2**: componentes acessíveis, tema customizado e dark mode.
- **NextAuth Credentials**: sessão segura via cookies HTTPOnly/Secure/SameSite, sem web storage.
- **Prisma + PostgreSQL**: schemas tipados e persistência robusta para produção.
- **Zod**: validação única para API e autenticação.
- **Recharts**: gráfico de categorias carregado dinamicamente no dashboard.

## Fluxo de dados
1. Usuário cadastra conta em `/register` com CAPTCHA.
2. API cria usuário, hash bcrypt e categorias padrão.
3. Login em `/login` valida CAPTCHA, rate limit e senha.
4. Sessão fica em cookie HTTPOnly.
5. Layout protegido consulta sessão no servidor.
6. Páginas carregam dados pelo Prisma em Server Components.
7. CRUD usa API Routes validadas com Zod e atualiza UI no cliente.
