# VellVista Database Schema & ORM Management Guide

This document covers the database tier of the **VellVista** application, including table schemas, Drizzle ORM configuration, migrations workflow, and multi-tenant hosting options (PostgreSQL vs. Supabase).

---

## 🗄️ Database Schema & Entities

The schema is defined in [schema.ts](file:///e:/program/Next.js/my-app/backend/src/schema.ts) using Drizzle ORM.

[![Database ER Diagram](https://mermaid.ink/img/pako:bdHBbsMwCAbgV0Gc0xfweW-w66QI2XRFSyDCONWU9t2rbKnabjmCP8Mve8FshTEh-5vQp9P4oQAArbLD5XI42AKVaxVTSHCi-v-YcramAQkG0a8d4DwLnyskOLsE7wjzwr6CaaC8B9RCjpIpxHR1zpllvsvJrbQc9a63up_JhTTqc_K_9hHudeYW6TlgL8HjKrNpkOjrxMe23Ts_FZeeKnY4so8kBdOCceJxff_CR2pD4LVDamHv35oxhTfumE2Fgrfv-W1ebw)](https://mermaid.live/edit#pako:bdHBbsMwCAbgV0Gc0xfweW-w66QI2XRFSyDCONWU9t2rbKnabjmCP8Mve8FshTEh-5vQp9P4oQAArbLD5XI42AKVaxVTSHCi-v-YcramAQkG0a8d4DwLnyskOLsE7wjzwr6CaaC8B9RCjpIpxHR1zpllvsvJrbQc9a63up_JhTTqc_K_9hHudeYW6TlgL8HjKrNpkOjrxMe23Ts_FZeeKnY4so8kBdOCceJxff_CR2pD4LVDamHv35oxhTfumE2Fgrfv-W1ebw)

### Table Reference

#### 1. User Management
*   **`user` Table**:
    - `id` (text, primary key) - Matches Better-Auth session tokens.
    - `name` (text, required) - User display name.
    - `email` (text, required, unique) - Authentication and contact email.
    - `role` (text, default: 'USER') - Permissions level: `USER`, `ADMIN`, `SUPER_ADMIN`.
    - `password` (text, optional) - Hashed local password (nullable for OAuth accounts).
    - `is_active` (boolean, default: true) - Accounts suspension flag.
    - `createdAt` & `updatedAt` (timestamp) - Tracking timestamps.
*   **`session` Table**: Holds active cookie logins (session tokens, expiration, user ID).
*   **`account` Table**: Stores OAuth provider bindings (Google client authentication mappings).
*   **`verification` Table**: Tracks registration and password reset tokens.

#### 2. E-Commerce Catalog
*   **`categories` Table**:
    - `id` (serial, primary key) - Internal ID.
    - `name` (text, required, unique) - e.g., 'Eau de Parfum', 'Oud', 'Fresh'.
    - `description` (text) - Category summary details.
*   **`products` Table**:
    - `id` (serial, primary key) - Internal ID.
    - `name` (text, required) - Product title.
    - `brand` (text, required) - Product manufacturer/brand name.
    - `description` (text) - Main product description text.
    - `categoryId` (integer, references categories) - Mapped category.
    - `rating` (numeric) - Aggregated rating cache (0.0 to 5.0).
    - `images` (jsonb/text array) - Image URLs (Cloudinary or local paths).
    - `isOnSale` (boolean, default: false) - Highlights product on sale.
*   **`product_variants` Table**:
    - `id` (serial, primary key) - Internal ID.
    - `productId` (integer, references products) - Parent product ID.
    - `size` (text, required) - Volume size, e.g., '50ml', '100ml'.
    - `price` (numeric, required) - Price for this variant package.
    - `stock` (integer, required, default: 0) - Inventory level.
    - `sku` (text, unique) - Stock keeping unit code.

#### 3. Social & Reviews
*   **`reviews` Table**:
    - `id` (serial, primary key) - Internal ID.
    - `productId` (integer, references products) - Target product.
    - `userId` (text, references user) - Author user ID.
    - `userName` (text) - Display author name.
    - `rating` (integer, required) - Star score (1 to 5).
    - `title` (text) - Review heading.
    - `comment` (text) - Detailed review body.
    - `image` (text, optional) - Path to review image attachment.
    - `isVerified` (boolean) - Validates order history purchases.
    - `helpfulCount` (integer) - Helpful upvote counter.

#### 4. Sales Orders
*   **`orders` Table**:
    - `id` (serial, primary key) - Unique order ID.
    - `userId` (text, references user) - Client user ID.
    - `totalAmount` (numeric, required) - Final computed checkout total.
    - `status` (text, default: 'Pending') - Flow: `Pending`, `Paid`, `Shipped`, `Delivered`, `Cancelled`.
    - `razorpayOrderId` (text) - Payment Gateway Order ID.
    - `razorpayPaymentId` (text) - Payment Gateway Transaction ID.
    - `shippingAddress` & `billingAddress` (jsonb) - Shipping metadata snapshots.
*   **`order_items` Table**:
    - `id` (serial, primary key) - Line item ID.
    - `orderId` (integer, references orders) - Parent order.
    - `productId` (integer, references products) - Base product.
    - `variantId` (integer, references product_variants) - Specific packaging variant.
    - `quantity` (integer, required) - Purchased quantity count.
    - `price` (numeric, required) - Price per unit at purchase.

---

## 🔌 Database Client Initialization (`backend/src/db.ts`)

We use the `postgres` library client to connect to PostgreSQL.
- **Connection String Resolution**: If `USE_SUPABASE=true`, the database connects to `SUPABASE_DB`. Otherwise, it connects to `DATABASE_URL`.
- **Prepared Statements**: Disabled (`prepare: false`) to ensure compatibility with Supabase connection poolers like PgBouncer.

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.USE_SUPABASE === 'true' 
  ? process.env.SUPABASE_DB 
  : process.env.DATABASE_URL;

// Connection Pool Client
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

---

## ⚡ ORM Workflow & Operations

### Generating and Pushing Schema Changes
1.  **Modify the Schema**: Make edits inside `backend/src/schema.ts` (e.g., add columns, change constraints).
2.  **Generate Migration Scripts**: Run Drizzle Kit to create a new SQL migration file:
    ```bash
    pnpm --filter backend run db:generate
    ```
3.  **Apply to Database (Direct push)**:
    ```bash
    pnpm --filter backend run db:push
    ```

### Utility Database Scripts
*   **Database Seeding**: Populates database with dummy products, categories, reviews, and test users:
    ```bash
    pnpm --filter backend run seed
    ```
*   **Database Resetting**: Purges all tables, drops constraints, and recreates the database schemas to a blank state:
    ```bash
    pnpm --filter backend run db:reset
    ```
*   **Image Path Migration**: Scan local product image assets, uploads them to Cloudinary, and updates DB paths:
    ```bash
    pnpm --filter backend run migrate-images
    ```

---

## 📦 Container Storage Persistence

*   **Docker Compose**:
    The PostgreSQL container uses a local named Docker volume `postgres_data` mapped to `/var/lib/postgresql/data` to ensure data persists when the container is recreated.
*   **Kubernetes**:
    A PersistentVolumeClaim (`postgres-pvc`) requests 5Gi of persistent disk space to ensure PostgreSQL data survives container terminations or restarts.
