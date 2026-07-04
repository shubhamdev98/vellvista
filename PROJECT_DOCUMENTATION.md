# VellVista Project Documentation

Welcome to the **VellVista** documentation. This project is a premium, full-stack e-commerce application designed for an online fragrance store. It features a modern, responsive frontend and a type-safe backend API within a monorepo setup using `pnpm` workspaces.

---

## 🛠️ Architecture & Monorepo Structure

The project is structured as a monorepo managed with **Turbo** and **pnpm**.

```
my-app/                         # Workspace Root & Frontend
├── app/                        # Next.js App Router (Pages, layouts, hooks, utils)
│   ├── account/                # User account layout & details
│   ├── address/                # User addresses management
│   ├── admin/                  # Admin dashboard & charting
│   ├── auth/                   # Authentication pages (Login, Sign-Up)
│   ├── cart/                   # Shopping Cart page
│   ├── checkout/               # Checkout & order processing
│   ├── hooks/                  # Custom React hooks (e.g., useApi)
│   ├── utils/                  # Core utility configurations (trpc, types)
│   └── page.tsx                # Homepage
├── components/                 # Shared React Components (Header, Hero, ProductGrid, etc.)
├── context/                    # Global React Context Providers (Auth, Cart, Currency, etc.)
├── lib/                        # Shared libraries
├── public/                     # Static assets (images, icons)
├── backend/                    # Backend Workspace (Sub-project)
│   ├── drizzle/                # Database migrations
│   ├── src/                    # Backend Source Code (Express, tRPC, Services, DB)
│   ├── package.json            # Backend dependencies & scripts
│   └── README.md               # Backend-specific instructions
├── package.json                # Root package.json with workspaces & monorepo scripts
└── turbo.json                  # Turborepo build caching configuration
```

---

## 💻 Tech Stack

### Frontend (Root Workspace)
*   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
*   **Library:** [React 19](https://react.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Client Communication:** [@trpc/client](https://trpc.io/)
*   **Authentication Client:** [Better Auth](https://www.better-auth.com/)
*   **Real-time Features:** [Socket.io Client](https://socket.io/)

### Backend (`/backend` Workspace)
*   **Runtime:** Node.js (>= 20)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **API Interface:** [tRPC](https://trpc.io/)
*   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Database:** PostgreSQL
*   **Validation:** [Zod](https://zod.dev/)

---

## 🧩 Key Frontend Modules

### 1. Context Providers (`/context`)
To manage global states efficiently across the application:
*   [AuthProvider.tsx](file:///e:/program/Next.js/my-app/context/AuthProvider.tsx): Handles authenticated session state, user login/logout status using Better Auth.
*   [CartProvider.tsx](file:///e:/program/Next.js/my-app/context/CartProvider.tsx): Tracks shopping cart items, prices, quantites, and controls additions/deletions.
*   [CurrencyProvider.tsx](file:///e:/program/Next.js/my-app/context/CurrencyProvider.tsx): Handles international currency conversions, selected currency symbols, and exchange rates.
*   [SocketProvider.tsx](file:///e:/program/Next.js/my-app/context/SocketProvider.tsx): Integrates WebSocket connections to update the application client in real-time.
*   [ToastProvider.tsx](file:///e:/program/Next.js/my-app/context/ToastProvider.tsx): Facilitates global app toast notifications.
*   [WishlistProvider.tsx](file:///e:/program/Next.js/my-app/context/WishlistProvider.tsx): Manages wishlist items and storage.

### 2. Custom Hooks & Utilities (`/app/hooks`, `/app/utils`)
*   [useApi.ts](file:///e:/program/Next.js/my-app/app/hooks/useApi.ts): Abstracted API interaction hook.
*   [trpcWrapper.ts](file:///e:/program/Next.js/my-app/app/utils/trpcWrapper.ts): Sets up tRPC wrapper query clients to call type-safe endpoints on the backend API.
*   [auth-client.ts](file:///e:/program/Next.js/my-app/app/utils/auth-client.ts): Client initialization for Better Auth.

---

## 🗄️ Database Schema & Backend Core

The schema is defined in [schema.ts](file:///e:/program/Next.js/my-app/backend/src/schema.ts) using Drizzle ORM.

### Database Tables:
1.  **User Table (`user`)**: Contains accounts data (name, email, verification, role: `USER`/`ADMIN`, password, is_active).
2.  **Session Table (`session`)**: Stores OAuth / Cookie login session states.
3.  **Account Table (`account`)**: OAuth provider bindings (e.g. Google authentication).
4.  **Verification Table (`verification`)**: Verifications tokens for registrations & password resets.
5.  **Products Table (`products`)**: Name, brand, rating, base description, categories, image URLs, and sale status.
6.  **Product Variants Table (`product_variants`)**: Holds sizes, volume (50ml, 100ml), specific pricing, stock levels, and SKUs.
7.  **Reviews Table (`reviews`)**: User ratings, comment headers, verified purchase flags, and upvote counters.
8.  **Categories Table (`categories`)**: Product classification definitions.
9.  **Orders Table (`orders`)**: Log of purchases including client details, shipment destinations, and order workflow state.
10. **Order Items Table (`order_items`)**: Line items connecting products, variants, quantities, and sales pricing to an Order.
11. **Subscribers Table (`subscribers`)**: Newsletter mailing lists.

---

## 🚀 Running the Project Locally

### 1. Configuration & Env Setup
Ensure you configure environment variables for both workspace areas:

*   **Frontend Environment:** Create [`.env.local`](file:///e:/program/Next.js/my-app/.env.local) in root workspace.
*   **Backend Environment:** Create [`.env`](file:///e:/program/Next.js/my-app/backend/.env) in the `/backend` folder.

### 2. Command Scripts

From the root project directory, you can run commands orchestrating the monorepo:

| Description | Command |
| :--- | :--- |
| **Install Dependencies** | `pnpm install` |
| **Run Dev Servers (Both Frontend & Backend)** | `pnpm run dev:all` |
| **Run Frontend Dev Server only** | `pnpm run dev` |
| **Build Both (Frontend & Backend)** | `pnpm run build:all` |
| **Generate Migrations (Backend)** | `pnpm --filter backend run db:generate` |
| **Execute Migrations (Backend)** | `pnpm --filter backend run db:migrate` |
| **Seed Database (Backend)** | `pnpm --filter backend run seed` |
| **Launch Database GUI (Drizzle Studio)** | `pnpm --filter backend run db:studio` |
