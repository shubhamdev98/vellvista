# 🌸 VellVista — Premium Fragrance E-Commerce Platform

**VellVista** is a modern, high-performance, full-stack e-commerce platform designed for an luxury online fragrance store. Built as a `pnpm` monorepo, it features a Next.js 16 App Router frontend, a type-safe Express.js tRPC API backend, Drizzle ORM with PostgreSQL, real-time Socket.io notifications, and a complete observability stack with Prometheus, Loki, and Grafana.

---

## ⚡ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Standalone Output), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons
- **Backend API**: [Express.js](https://expressjs.com/), [tRPC v10](https://trpc.io/) (Type-safe client/server contract), [Better Auth](https://www.better-auth.com/), [Socket.io](https://socket.io/)
- **Database & ORM**: [PostgreSQL 15](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/), Drizzle Kit
- **DevOps & Infra**: Docker & Docker Compose (Multi-stage builds), Kubernetes (Kustomize manifests), Prometheus, Loki, Promtail, Grafana

---

## 📁 Repository Structure

```text
my-app/
├── app/                        # Next.js 16 App Router (Storefront, Auth, Admin, Dashboards)
├── components/                 # Shared React UI components & layout sections
├── context/                    # React Context Providers (Auth, Cart, Wishlist, Socket)
├── lib/                        # Shared utilities & tRPC client setup
├── backend/                    # Express.js tRPC Backend API
│   ├── src/                    # Controllers, routers, database schema, services
│   ├── drizzle/                # PostgreSQL schema migrations
│   └── package.json            # Backend sub-project manifest
├── infra/                      # Infrastructure & Container Orchestration
│   ├── docker/                 # Production multi-stage Dockerfiles & configs
│   ├── k8s/                    # Kubernetes manifests & Kustomize configuration
│   └── docker-compose.yml      # Local orchestration file
├── docs/                       # Engineering & Operations Guides
├── PROJECT_DOCUMENTATION.md    # Central Documentation Portal index
└── package.json                # Workspace root package configuration
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: `>= 20.x`
- **pnpm**: `9.15.4` (`corepack enable`)
- **PostgreSQL**: Running locally or via Docker

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory and a `.env` file in `backend/`:
```env
# Root / Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Backend (backend/.env)
PORT=3001
SUPABASE_DB=postgresql://postgres:postgres@localhost:5432/vellvista
BETTER_AUTH_SECRET=your_32_character_secret_key_here
BETTER_AUTH_URL=http://localhost:3001
```

### 3. Run Database Migrations
```bash
pnpm --filter backend run db:push
```

### 4. Start Development Servers
Run both frontend and backend concurrently via Turborepo:
```bash
pnpm dev:all
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`
- **Swagger Docs**: `http://localhost:3001/docs`

---

## 🐋 Infrastructure & Container Orchestration (`infra/`)

All containerization assets reside in the [`infra/`](file:///e:/program/Next.js/my-app/infra) directory.

### 1. Fast Development / Testing Stack (Core App Only)
Launches PostgreSQL, Express Backend, and Next.js Frontend using Next.js Standalone Mode:
```bash
cd infra
docker compose up --build
```

### 2. Full Observability Stack (Core App + Monitoring)
Launches the application alongside **Prometheus** (metrics), **Loki** (logs), **Promtail**, and **Grafana** (dashboards):
```bash
cd infra
docker compose --profile monitoring up --build
```
- **Grafana Dashboard**: `http://localhost:3002` (Login: `admin` / `admin`)
- **Prometheus Metrics**: `http://localhost:9090`
- **Loki Logs**: `http://localhost:3100`

---

## 📖 Documentation & Guides

For comprehensive technical documentation, refer to the following:

- 📚 [**PROJECT_DOCUMENTATION.md**](file:///e:/program/Next.js/my-app/PROJECT_DOCUMENTATION.md) — Central Documentation Portal
- 🚀 [**Getting Started Guide**](file:///e:/program/Next.js/my-app/docs/getting-started.md)
- 🎨 [**Frontend Architecture Guide**](file:///e:/program/Next.js/my-app/docs/frontend.md)
- ⚡ [**Backend & API Guide**](file:///e:/program/Next.js/my-app/docs/backend.md)
- 🗄️ [**Database Schemas & ORM Guide**](file:///e:/program/Next.js/my-app/docs/database.md)
- 🐋 [**DevOps & Deployment Guide**](file:///e:/program/Next.js/my-app/docs/devops.md)
- 📜 [**Swagger OpenAPI Portal**](file:///e:/program/Next.js/my-app/docs/swagger.md)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
