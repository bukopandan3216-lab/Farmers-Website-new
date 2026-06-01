Environment configuration
=========================

Do NOT commit your `.env` file. For production deployments (Vercel, Render, etc.) set the environment variables using the platform's Secrets/Environment UI.

Recommended vars (also present in `.env.example`):

- `DATABASE_URL` — your Postgres connection string
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` — SMTP credentials for sending emails
- `FRONTEND_URL` — public URL to frontend (used to build account creation links)

Local development:
- Copy `backend/.env.example` → `backend/.env` and fill values.
- `.env` is listed in `.gitignore` and should not be pushed to git.

Production:
- On Vercel: Dashboard → Project → Settings → Environment Variables. Add the variables there.
- On Render: Dashboard → Service → Environment → Environment > Add the variables there.

Security note:
- Never paste SMTP passwords or other secrets into public chat. Use the platform UI or local `.env` instead.
