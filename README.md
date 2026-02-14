# Frontend - Bot Fazendeiro

Painel web React/TypeScript para operação dos tenants do Bot Fazendeiro.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Supabase JS
- TanStack Query

## Arquitetura funcional

1. Login com Discord via Supabase Auth.
2. `AuthProvider` resolve usuário + vínculos em `usuarios_frontend`.
3. Rotas protegidas exigem autenticação e role (`funcionario/admin/superadmin`).
4. Checkout usa API backend com bearer token:
   - `POST /api/pix/create`
   - `GET /api/pix/status/{payment_id}`

## Variáveis de ambiente

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
VITE_API_URL=http://localhost:8000
```

## Scripts

```bash
npm install
npm run dev
npm run test
npm run build
npm run preview
```

## Deploy (Coolify)

- Build usa `frontend/Dockerfile`.
- Serviço estático servido por Nginx (`frontend/nginx.conf`).
- Healthcheck: `GET /health`.
- CI/CD: `frontend/.github/workflows/frontend-ci-cd.yml` com deploy via `COOLIFY_FRONTEND_DEPLOY_HOOK`.

## Segurança e contratos

- Checkout não consulta status sensível direto no Supabase.
- API de pagamento exige JWT do usuário.
- Tenant authorization ocorre no backend por `guild_id` e `discord_id`.

## Limites conhecidos

- Suite de testes frontend ainda pequena (smoke).
- Recomendada expansão para testes de fluxo:
  - login/callback
  - checkout completo
  - rota protegida por role
