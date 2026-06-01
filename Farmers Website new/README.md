# FarmDirect Farmers Marketplace

Production-ready React + Vite marketplace with an Express/Prisma API, Supabase PostgreSQL/storage, JWT authentication, seeded demo data, and deployment config for Vercel + Render.

## Stack

- Frontend: React, Vite, TypeScript, React Router, TanStack Query, Axios, Tailwind/shadcn UI, Sonner toasts
- Backend: Node.js, Express, TypeScript, Prisma, JWT + refresh tokens, bcrypt, Swagger, Helmet, CORS, rate limiting
- Infrastructure: Supabase PostgreSQL + Storage, Vercel frontend, Render backend

## Local Development

```bash
pnpm install
cp .env.example .env
cp backend/.env.example backend/.env
```

Configure `backend/.env` with your Supabase PostgreSQL `DATABASE_URL`, then run:

```bash
cd backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
pnpm dev
```

In another terminal:

```bash
pnpm dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`  
Swagger: `http://localhost:5000/api/docs`

## Seeded Demo Accounts

All demo accounts use password `password`.

- Admin: `admin@farmdirect.com`
- Farmer: `farmer1@farmdirect.com`
- Buyer: `buyer1@example.com`

The seed creates 1 admin, 5 farmers, 10 buyers, 42 products, reviews, messages, and sample pending/completed orders.

## Database

Core models:

- `User`: buyers, farmers, admins
- `FarmerProfile`: farm metadata and verification
- `Category`, `Product`
- `Order`, `OrderItem`
- `Review`, `Message`, `Cart`, `CartItem`, `Favorite`
- `RefreshToken`

Run Supabase storage setup:

```sql
-- backend/supabase-storage.sql
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel, Render, and Supabase setup.
