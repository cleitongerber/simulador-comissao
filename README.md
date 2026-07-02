# Simulador de Comissao Online

App web Node.js com painel Admin, login por colaborador e salvamento centralizado em banco online.

## Rodar localmente

```bash
node server.js
```

Acesse `http://localhost:3000`.

Sem `DATABASE_URL`, os dados ficam em `data/state.json`. Com `DATABASE_URL`, os dados ficam em Postgres na tabela `app_state`.

## Hospedagem gratis recomendada

- Site/app Node: Render Web Service no plano Free.
- Banco Postgres: Neon Free, usando a connection string como `DATABASE_URL`.

Render tambem tem Postgres Free, mas a pagina oficial informa limite de 30 dias para o banco gratuito; por isso Neon e melhor para manter os dados.

## Publicar no Render

1. Suba esta pasta para um repositorio GitHub.
2. Crie uma conta no Neon e um banco Postgres Free.
3. Copie a connection string do Neon.
4. No Render, crie um Web Service a partir do repositorio GitHub.
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `DATABASE_URL`: connection string do Neon
     - `PGSSL`: `true`
     - `ADMIN_PASSWORD`: `admin123`

## Senhas iniciais

- Admin: `admin123`
- Colaboradores: `1234`

Depois de publicado, altere as senhas pelo Admin.
