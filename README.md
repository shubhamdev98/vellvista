# 🌸 VellVista — Premium Luxury Fragrance E-Commerce Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.2-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![tRPC v10](https://img.shields.io/badge/tRPC-v10-2563eb?logo=trpc)](https://trpc.io/)
[![Express.js](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.29-c5f742)](https://orm.drizzle.team/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**VellVista** is an enterprise-grade, high-performance, full-stack e-commerce platform crafted for an online luxury fragrance boutique. Engineered as a `pnpm` workspace monorepo, it combines a cutting-edge **Next.js 16 App Router** storefront with a type-safe **Express.js + tRPC v10** backend API, **Drizzle ORM + PostgreSQL** persistence layer, real-time **Socket.io** event dispatching, and a complete observability stack with **Prometheus**, **Loki**, and **Grafana**.

---

## ✨ Features Overview

### 🛍️ Storefront & User Experience

- **Luxury Catalog & Filtering**: Browse premium perfumes, filter by scent profiles/notes, brands, price ranges, and gender.
- **Dynamic Search & Product Detail Pages**: High-resolution image galleries, olfactory fragrance pyramids (Top, Heart, Base notes), stock availability, and customer reviews.
- **Interactive Cart & Wishlist**: Real-time persistent shopping cart, quantity controls, and wishlist management.
- **Multi-Address Management**: Saved delivery addresses with postal verification and default address flags.
- **Seamless Checkout**: Razorpay payment integration, order summary breakdown, tax calculations, and instant invoice generation.

### 🔐 Authentication & Role Management

- **Better Auth Integration**: Secure session-based authentication supporting customer, vendor, and admin roles.
- **User Profile Dashboard**: View order history, track order statuses, manage delivery preferences, and update personal account details.
- **Vendor Portal**: Vendor-specific dashboard for product listing management, order fulfillment, and sales metrics.
- **Admin Control Center**: System-wide control panel for user role assignments, product approvals, platform metrics, and audit logs.

### ⚡ Backend API & Real-Time Engine

- **End-to-End Type Safety**: Shared tRPC router contracts between Next.js frontend and Express backend.
- **OpenAPI & Swagger Documentation**: Auto-generated Swagger UI accessible directly at `/docs`.
- **Real-Time Notifications**: Socket.io web-sockets for order updates, stock alerts, and promotional announcements.
- **Image Optimization & Cloud Storage**: Cloudinary integration alongside local fallback storage and automated image migration scripts.

### 📊 Observability & DevOps

- **Metrics & Logging**: Prometheus metrics exporter (`prom-client`), Loki centralized logging via Promtail daemon.
- **Grafana Visualization**: Pre-built dashboards monitoring HTTP throughput, error rates, tRPC procedure response times, and database connections.
- **Containerization**: Multi-stage Dockerfiles utilizing Next.js standalone output and Turborepo build caching.
- **Kubernetes Ready**: Kustomize-driven Kubernetes manifests for seamless cloud-native deployments.

---

## 🛠️ Tech Stack Matrix

| Category                     | Technology                  | Description                                                               |
| :--------------------------- | :-------------------------- | :------------------------------------------------------------------------ |
| **Frontend Framework** | Next.js 16.2.2              | App Router with Turbopack & React 19 Server/Client Components             |
| **Styling & UI**       | Tailwind CSS v4 & Lucide    | Modern design system, HSL color tokens, responsive layouts & icons        |
| **Backend Framework**  | Express.js 4.18             | Node.js web server powering the REST & tRPC API endpoints                 |
| **API Contract**       | tRPC v10 & Zod              | End-to-end full-stack type safety with schema validation                  |
| **Database & ORM**     | PostgreSQL 15 & Drizzle ORM | Relational schema with Drizzle Kit push/migration workflow                |
| **Authentication**     | Better Auth 1.6             | Session management, password hashing (Bcrypt), and role-based permissions |
| **Payments**           | Razorpay SDK                | Secure online payment gateway checkout pipeline                           |
| **Real-time Engine**   | Socket.io 4.8               | Web-socket transport for real-time notifications and updates              |
| **Container & K8s**    | Docker & Kubernetes         | Docker Compose multi-service stacks & Kustomize manifests                 |
| **Observability**      | Prometheus, Loki & Grafana  | Metrics collection, log aggregation, and real-time dashboarding           |

---

## 📁 Repository Structure

```text
my-app/
├── app/                        # Next.js 16 App Router Pages & Components
│   ├── account/                # Customer profile & account management
│   ├── address/                # Shipping address management
│   ├── admin/                  # System administrator control panel
│   ├── auth/                   # Login, signup, and authentication flows
│   ├── cart/                   # Shopping cart page
│   ├── checkout/               # Payment processing & order placement
│   ├── docs/                   # Embedded documentation pages
│   ├── products/               # Product catalog, detail pages, & reviews
│   ├── store/                  # Storefront discovery & category pages
│   ├── vendor/                 # Vendor management portal
│   └── wishlist/               # Customer saved products
├── components/                 # Reusable UI component library & layout elements
├── context/                    # React Contexts (Auth, Cart, Wishlist, Socket)
├── lib/                        # Shared utility modules, API clients & tRPC hooks
├── backend/                    # Express.js tRPC Backend API Project
│   ├── src/                    # API controllers, routers, DB schema & services
│   ├── drizzle/                # PostgreSQL migration scripts & snapshots
│   └── package.json            # Backend dependencies & npm scripts
├── infra/                      # Cloud Infrastructure & DevOps Configuration
│   ├── docker/                 # Production Dockerfiles & monitoring configs (Loki/Grafana)
│   ├── k8s/                    # Kubernetes manifests & Kustomization files
│   └── docker-compose.yml      # Local container orchestration manifest
├── docs/                       # Engineering specifications & setup guides
├── scripts/                    # Maintenance & utility scripts
├── start.bat                   # Quick start batch file for Windows environment
└── package.json                # Turborepo & workspace root configuration
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js**: `>= 20.x`
- **pnpm**: `9.15.4` (`corepack enable`)
- **PostgreSQL**: `15.x` (Local service or via Docker container)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/shubhamdev98/vellvista.git
cd my-app
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` in the root directory:

```env
# Root / Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Create a `.env` file in `backend/`:

```env
# Backend (backend/.env)
PORT=3001
SUPABASE_DB=postgresql://postgres:postgres@localhost:5432/vellvista
BETTER_AUTH_SECRET=your_32_character_secret_key_here
BETTER_AUTH_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Initialize & Seed Database

```bash
# Push schema changes to PostgreSQL database
pnpm --filter backend run db:push

# Seed initial catalog products, categories, and test user accounts
pnpm --filter backend run seed
```

### 4. Start Development Servers

Run both frontend and backend concurrently via Turborepo:

```bash
pnpm dev:all
```

Alternatively, on Windows you can run:

```cmd
start.bat
```

### 🌐 Service Endpoints Summary

| Service                      | Endpoint URL                   | Description                                    |
| :--------------------------- | :----------------------------- | :--------------------------------------------- |
| **Storefront App**     | `http://localhost:3000`      | Next.js 16 Web Application                     |
| **Backend API**        | `http://localhost:3001`      | Express REST & tRPC Server                     |
| **Swagger API Portal** | `http://localhost:3001/docs` | OpenAPI documentation interface                |
| **Grafana Dashboard**  | `http://localhost:3002`      | Observability dashboards (`admin`/`admin`) |
| **Prometheus Metrics** | `http://localhost:9090`      | Application metrics scraper                    |
| **Loki Log Server**    | `http://localhost:3100`      | Centralized log ingestion endpoint             |

---

## 📜 Available NPM Scripts

### Workspace Root Scripts

- `pnpm dev:all` — Start frontend and backend dev servers concurrently with Turborepo.
- `pnpm build:all` — Build both frontend and backend for production.
- `pnpm dev` — Launch Next.js dev server solo (`http://localhost:3000`).
- `pnpm build` — Generate Next.js production build bundle.
- `pnpm lint` — Execute ESLint static analysis across the application code.

### Backend Sub-Package Scripts (`pnpm --filter backend <script>`)

- `pnpm --filter backend run dev` — Run backend server using `tsx watch`.
- `pnpm --filter backend run db:push` — Push Drizzle ORM schema to PostgreSQL database.
- `pnpm --filter backend run db:generate` — Generate SQL migration files in `backend/drizzle`.
- `pnpm --filter backend run db:studio` — Open Drizzle Studio database UI.
- `pnpm --filter backend run seed` — Seed initial database tables with mock data.
- `pnpm --filter backend run migrate-images` — Sync local product images with Cloudinary.

---

## 🐋 Infrastructure & Containerization (`infra/`)

### 1. Minimal Development Container Stack

Spins up PostgreSQL database, Express API server, and Next.js Frontend:

```bash
cd infra
docker compose up --build
```

### 2. Complete Observability & Monitoring Stack

Launches application services along with **Prometheus**, **Loki**, **Promtail**, and **Grafana**:

```bash
cd infra
docker compose --profile monitoring up --build
```

### 3. Kubernetes Deployment (Kustomize)

Deploy the full stack onto a Kubernetes cluster:

```bash
kubectl apply -k infra/k8s
```

---

## 📚 Technical Documentation Hub

For detailed operational and architectural documentation, refer to the guides in [`docs/`](file:///e:/program/Next.js/my-app/docs):

- 🚀 [**Getting Started Guide**](file:///e:/program/Next.js/my-app/docs/getting-started.md) — Prerequisites, environment variables, and setup instructions.
- 🎨 [**Frontend Architecture Guide**](file:///e:/program/Next.js/my-app/docs/frontend.md) — Component layout, state management, and styling principles.
- ⚡ [**Backend & API Guide**](file:///e:/program/Next.js/my-app/docs/backend.md) — Express + tRPC procedure setup, authentication, and services.
- 🗄️ [**Database Schemas & ORM Guide**](file:///e:/program/Next.js/my-app/docs/database.md) — Drizzle ORM models, relations, and migration workflows.
- 🐋 [**DevOps & Deployment Guide**](file:///e:/program/Next.js/my-app/docs/devops.md) — Docker container builds, Compose stacks, and K8s configuration.
- 🌍 [**Environments Guide**](file:///e:/program/Next.js/my-app/docs/environments.md) — Staging, production, and env var management.
- 📜 [**Swagger & OpenAPI Portal**](file:///e:/program/Next.js/my-app/docs/swagger.md) — Interactive REST/OpenAPI documentation reference.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
