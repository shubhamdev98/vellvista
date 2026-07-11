# VellVista Developer Onboarding & Getting Started Guide

This guide takes you through the step-by-step process of setting up, running, developing, and deploying the **VellVista** e-commerce system.

---

## 🛠️ Prerequisites

Before you start, make sure you have installed:
1.  **Node.js** (v20 or higher)
2.  **pnpm** (v9.15.4 or higher) - Install using `npm i -g pnpm`
3.  **Git**
4.  **Docker Desktop** (Required for containerized development)
5.  **PostgreSQL** (If running database services natively outside Docker)

---

## 🏁 Step-by-Step Setup

### Step 1: Clone the Repository
Clone the repository to your local machine and navigate to the project directory:
```bash
git clone <repository-url>
cd my-app
```

### Step 2: Install Workspace Dependencies
VellVista uses `pnpm` workspaces to manage dependencies across the monorepo:
```bash
pnpm install
```

### Step 3: Configure Environment Variables
You need to create separate configuration files for the frontend (root) and backend:

1.  **Frontend Config**: Create a file named `.env.local` in the root directory:
    ```env
    PORT=3000
    NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
    NEXT_PUBLIC_API_URL=http://localhost:3001
    ```
2.  **Backend Config**: Create a file named `.env` in the `backend/` directory (you can copy the example file first):
    ```bash
    cp backend/.env.example backend/.env
    ```
    Open `backend/.env` and update your PostgreSQL connection credentials:
    ```env
    DATABASE_URL=postgresql://postgres:<your-password>@localhost:5432/vellvista
    PORT=3001
    FRONTEND_URL=http://localhost:3000
    BETTER_AUTH_SECRET=your-super-secret-random-string-min-32-chars
    BETTER_AUTH_URL=http://localhost:3001
    ```

### Step 4: Initialize the Database
Before running the application, you need to create the database schemas and populate initial catalogs (categories, products, and admin users):
```bash
# Push schema structure directly to your PostgreSQL database
pnpm --filter backend run db:push

# Seed the database with products and initial admin accounts
pnpm --filter backend run seed
```

---

## 🚀 Running the Application

Choose one of three ways to run the project locally:

### Method 1: Native Development (Best for Active Development)
Start the frontend and backend development servers concurrently. They will hot-reload as you write code:
```bash
pnpm run dev:all
```
- Frontend: Open [http://localhost:3000](http://localhost:3000)
- Backend API & Health: Open [http://localhost:3001/health](http://localhost:3001/health)

### Method 2: Docker Compose (Best for Testing Deployment)
Run the entire stack inside container isolated environments matching production:
```bash
# From the root directory
docker compose -f infra/docker-compose.yml up --build
```
- The database is initialized and migrated automatically using the [backend-entrypoint.sh](file:///e:/program/Next.js/my-app/infra/docker/backend-entrypoint.sh) script.
- Frontend: Open [http://localhost:3000](http://localhost:3000)
- Backend: Open [http://localhost:3001](http://localhost:3001)

### Method 3: Kubernetes (Replicating Cloud Cluster)
```bash
# Apply all manifests in the cluster
kubectl apply -k infra/k8s/

# Fetch your Ingress external IP and add it to your hosts file:
# 127.0.0.1 vellvista.local
```
- Open [http://vellvista.local](http://vellvista.local) to browse the website.

---

## 💻 Daily Development Workflow

When adding new features or making updates, follow these typical workflows:

### Adding Frontend Features
- Create components inside the `/components` folder using Tailwind CSS.
- Add page routes under the `/app` folder.
- Inject global states using providers in the `/context` folder.
- Retrieve data from backend APIs using the tRPC wrapper:
  ```typescript
  import { trpc } from '@/app/utils/trpc';
  const { data: products } = trpc.getProducts.useQuery();
  ```

### Modifying Backend APIs
- Edit routes and validation procedures in [backend/src/trpc.ts](file:///e:/program/Next.js/my-app/backend/src/trpc.ts).
- Write operational logic inside [backend/src/services/](file:///e:/program/Next.js/my-app/backend/src/services/).

### Modifying Database Schema
If you need to change your database structures:
1. Update table mappings in [backend/src/schema.ts](file:///e:/program/Next.js/my-app/backend/src/schema.ts).
2. Generate a migration snapshot:
   ```bash
   pnpm --filter backend run db:generate
   ```
3. Push the updates to your active database:
   ```bash
   pnpm --filter backend run db:push
   ```

---

## 🔄 Committing & Pushing to Production (CI/CD)

Once your code is ready, commit it and push to your git repository:
```bash
git add .
git commit -m "feat: added new review analytics dashboard"
git push origin master
```

### What Happens Behind the Scenes on the Server?
1.  **Continuous Integration (CI)**:
    - The repository's webhooks trigger a build pipeline (e.g., GitHub Actions).
    - Code is compiled, linted (`pnpm lint`), and tested.
2.  **Container Building & Storing**:
    - The runner builds new Docker images using `infra/docker/frontend.Dockerfile` and `infra/docker/backend.Dockerfile`.
    - These images are tagged with the Git commit hash and pushed to a secure cloud registry (like Docker Hub, AWS ECR, or Google Artifact Registry).
3.  **Database Migration & Deployment (CD)**:
    - The pipeline updates the Kubernetes cluster deployments to point to the new image tags.
    - Kubernetes starts the new backend pod first. Before the server listens to traffic, the [backend-entrypoint.sh](file:///e:/program/Next.js/my-app/infra/docker/backend-entrypoint.sh) script automatically runs `npx drizzle-kit push:pg` to migrate the database schema.
    - Once the new pods pass their health checks, the Ingress controller starts routing user traffic to the updated containers, and older containers are safely terminated (Zero Downtime).
