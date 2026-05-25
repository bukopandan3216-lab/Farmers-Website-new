# Deployment Guide

## Supabase

1. Create a Supabase project.
2. Copy the pooled PostgreSQL connection string into `backend/DATABASE_URL`.
3. Run `backend/supabase-storage.sql` in the Supabase SQL editor to create public image buckets.
4. From `backend`, run:

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
```

Demo accounts all use `password`:

- `admin@farmdirect.com`
- `farmer1@farmdirect.com`
- `buyer1@example.com`

## Render API

1. Create a new Render Web Service from the `backend` directory.
2. Use `pnpm install && pnpm prisma:generate && pnpm build` as the build command.
3. Use `pnpm start` as the start command.
4. Set the environment variables from `backend/.env.example`.
5. Set `CLIENT_URL` to the Vercel frontend URL.
6. Health check path: `/health`.

## Vercel Frontend

1. Import the project root into Vercel.
2. Set framework preset to Vite.
3. Set `VITE_API_URL` to `https://your-render-service.onrender.com/api`.
4. Set Supabase public env vars from `.env.example`.
5. Deploy. The included `vercel.json` rewrites React Router routes to `index.html`.

## API Docs

After the backend is running, Swagger UI is available at:

```text
https://your-render-service.onrender.com/api/docs
```
