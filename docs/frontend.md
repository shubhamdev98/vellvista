# VellVista Frontend Workflow & Development Guide

This document describes the design, architecture, and developer workflow of the **VellVista** Next.js frontend application.

---

## 📁 Directory Structure & Modules

The frontend is located at the root of the monorepo:

```
my-app/
├── app/                        # Next.js App Router (Pages, layouts, custom hooks)
│   ├── account/                # User dashboard overview & settings
│   ├── address/                # Shipping and billing address management
│   ├── admin/                  # Admin-only dashboards (Orders, Products, Reviews, Charts)
│   ├── auth/                   # Credentials-based Sign-in, Register, OTP, Reset Password
│   ├── cart/                   # Shopping Cart summary and update controls
│   ├── checkout/               # Checkout process and Razorpay payment callbacks
│   ├── hooks/                  # Global hooks (e.g. useApi.ts)
│   ├── products/               # Product details page with real-time review updates
│   ├── profile/                # User profile updating
│   ├── utils/                  # tRPC client wrappers, types, auth-client
│   ├── wishlist/               # Wishlist list view
│   ├── globals.css             # Tailwind v4 CSS setup
│   └── layout.tsx              # Root HTML wrapper with state providers
├── components/                 # Shared UI Components
│   ├── ui/                     # Basic reusable elements (Badge, Button, Card, Input, Skeleton)
│   ├── AdminCharts.tsx         # Charting dashboards for admin statistics
│   ├── Header.tsx              # Navigation bar, search inputs, currency & cart togglers
│   ├── Hero.tsx                # Video-background promotion banner
│   └── ProductGrid.tsx         # Products grid list with sorting & filtering
├── context/                    # React Context State Providers
│   ├── AuthProvider.tsx        # Better-Auth user session and role context
│   ├── CartProvider.tsx        # In-memory shopping cart item tracking
│   ├── CurrencyProvider.tsx    # Conversion rates and pricing symbols
│   ├── SocketProvider.tsx      # Real-time WebSocket connection engine
│   ├── ToastProvider.tsx       # Toast alert system
│   └── WishlistProvider.tsx    # User wishlist tracking
└── public/                     # Static media files (logos, placeholder banners)
```

---

## 🔄 Global State & Context Providers

VellVista manages its global states inside `context/` wrapped around the entire application inside `app/layout.tsx`:

### 1. Authentication State (`context/AuthProvider.tsx`)
- Integrates with the [Better Auth](https://www.better-auth.com/) client.
- Exposes `session`, `user` objects, and helper flags (e.g., `isAdmin`, `isSuperAdmin`, `loading`).
- Keeps user state synced across browser sessions using cookies.

### 2. Shopping Cart (`context/CartProvider.tsx`)
- Handles local operations to add, remove, clear, and modify items.
- Computes checkout subtotals, item counts, and syncs cart details with browser `localStorage` for session persistence.

### 3. Currency System (`context/CurrencyProvider.tsx`)
- Exposes conversion helper functions to display products in multiple currencies (e.g., INR, USD, EUR).
- Keeps track of currency symbols, conversion rates, and selected preferences.

### 4. WebSocket Manager (`context/SocketProvider.tsx`)
- Initializes a Socket.io-client connection pointing to the backend socket endpoint (`process.env.NEXT_PUBLIC_SOCKET_URL`).
- Exposes the active `socket` connection to child components (e.g., product pages for real-time reviews).

### 5. Notification Toast Manager (`context/ToastProvider.tsx`)
- Exposes simple methods (`showSuccess`, `showError`, `showWarning`) to pop up temporary feedback banners on the screen.

---

## 📡 API Client Communication

The frontend communicates with the backend through two mechanisms:

### 1. tRPC Client (`app/utils/trpcWrapper.ts` & `app/utils/trpc.ts`)
We use type-safe **tRPC** queries and mutations. The client reads `NEXT_PUBLIC_BACKEND_URL` to point to `/trpc` endpoint of the Express server.
- **tRPC hooks**: Custom queries fetch products, categories, reviews, and place orders directly without writing manual fetch headers.
- **Type Safety**: Any change in backend Express models/routers is immediately visible to the frontend compiler.

### 2. Authentication client (`app/utils/auth-client.ts`)
Initializes the Better Auth client using the backend auth endpoint.

---

## 🎨 Styling & Design Aesthetics

- **Tailwind CSS v4**: Installed using `@tailwindcss/postcss` and configured directly inside [app/globals.css](file:///e:/program/Next.js/my-app/app/globals.css). Ad-hoc utility styling is avoided in favor of organized classes.
- **Lucide Icons**: Provided via `lucide-react` for clean SVG interface icons.
- **Glassmorphism & Gradients**: Applied on UI components, buttons, inputs, and cards.
- **Transitions & Hover Effects**: Subtle animations (e.g. `transition-all duration-300 hover:scale-105`) enhance component interactivity.

---

## ⚡ Developer Execution Commands

To start the frontend locally (without Docker):
```bash
# Install dependencies from root directory
pnpm install

# Run frontend in development mode
pnpm run dev

# Compile production build
pnpm run build

# Start compiled production server locally
pnpm run start
```
*Note: Make sure `NEXT_PUBLIC_BACKEND_URL` is set in your `.env.local` to allow API queries to fetch backend data.*
