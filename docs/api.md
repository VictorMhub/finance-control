# API

Todas as rotas retornam JSON. Rotas protegidas exigem sessão válida.

## Autenticação
### `POST /api/register`
Request:
```json
{
  "name": "Maria",
  "email": "maria@example.com",
  "password": "senha-segura",
  "monthlyIncome": 5000,
  "captchaToken": "token"
}
```
Response `201`: `{ "user": { "id": "...", "name": "Maria", "email": "..." } }`
Erros: `400`, `409`, `429`.

### `POST /api/auth/[...nextauth]`
Gerenciado pelo NextAuth Credentials Provider. Campos: `email`, `password`, `captchaToken`.

## Categorias
### `GET /api/categories`
Response: `{ "categories": [] }`

### `POST /api/categories`
Schema Zod: `name`, `color`, `type` opcional (`INCOME`/`EXPENSE`).

## Transações
### `GET /api/transactions`
Filtros query: `from`, `to`, `categoryId`, `type`.

### `POST /api/transactions`
```json
{
  "amount": 120,
  "description": "Mercado",
  "date": "2026-08-18",
  "type": "EXPENSE",
  "categoryId": "...",
  "isFixed": false
}
```

### `PUT /api/transactions/:id`
Mesmo schema do POST.

### `DELETE /api/transactions/:id`
Response: `{ "ok": true }`

## Metas
### `GET /api/goals`
Response: `{ "goals": [] }`

### `POST /api/goals`
```json
{
  "title": "Viagem",
  "targetAmount": 10000,
  "savedAmount": 1500,
  "monthlyContribution": 500,
  "monthlyIncome": 5000
}
```

### `PUT /api/goals/:id`
Mesmo schema do POST.

### `DELETE /api/goals/:id`
Response: `{ "ok": true }`

## Erros comuns
- `400`: payload inválido.
- `401`: usuário não autenticado.
- `403`: origem inválida.
- `404`: recurso não encontrado.
- `429`: muitas tentativas.
