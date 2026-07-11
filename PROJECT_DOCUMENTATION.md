# VellVista Project Documentation Portal

Welcome to the **VellVista** engineering and operations documentation portal. This project is a premium, full-stack e-commerce application designed for an online fragrance store. It features a modern, responsive Next.js frontend and a type-safe Express.js tRPC backend API structured in a monorepo setup using `pnpm` workspaces.

---

## 🏗️ System Architecture

The application is split into two major component layers: a client-facing Next.js frontend and an Express.js backend API communicating over type-safe HTTP/WS (via tRPC and Socket.io). In containerized environments, an NGINX Ingress controller routes traffic under a single domain origin to manage paths cleanly.

[![VellVista System Architecture](https://mermaid.ink/img/pako:dZNtT9tADMe_ipUXE0gt7cYmoWpCoi2wirXNmqJNCrxwEze59XIX-RxKIXz3KUmfNo28OP3t8_3OsX2vXmRj8nreUtt1lCILzIcPBgBgoBUZOQnvHTH02a4d8eMpfG23L6H8Np_70IGftAhstCJxJYxMwuRcOLkdTX7tLBhYI2y1Jn5ssM3qikXCmKdwd-EgvCsWxIaEHHRgWAEZBrpwsj9VfTtku31ZdqCEG7ZGyMThhJ7l7LfbO6ANvmWB8263-9554TxqQQdz1cFC0hZ0mJ4UrV0JfYxWFfb6Oa_jt_YR9eMRdbdb1aUcsnp50QTT2bgE3zqpbgxPtir48R2GKLhARzval8_nn063ODLxg_mnPvMUcewjywbCWkNjBMRPKiL3n0yqRAJyTlkDV4WkJfRJhLjSYSNrP1ybRBk6Juzjasi0Vjfarku4tTbRVHvCRkOz7bN9UvFfjTpOZJRhQnCfa4uxK2GgbRErg7wJDxLGFCuEQCxjQu-AfNxkZMTBIKVoZQspYYYvlnPchDsB2yC4RaE1bt5BTec-fIArTVzNbTCe--HExpSh0sS1DWNUuq7x_sfq5hwG-DBrZ1XfFVMkcOWPIEKtqzEeTGcBLFHrBUar_VB5LS8jzlDFXu_Vk5Sy6vHFtMRCi_fW8rAQG2xM5PWEC2p5RR6j0FBhwpg1zrc_)](https://mermaid.live/edit#pako:dZNtT9tADMe_ipUXE0gt7cYmoWpCoi2wirXNmqJNCrxwEze59XIX-RxKIXz3KUmfNo28OP3t8_3OsX2vXmRj8nreUtt1lCILzIcPBgBgoBUZOQnvHTH02a4d8eMpfG23L6H8Np_70IGftAhstCJxJYxMwuRcOLkdTX7tLBhYI2y1Jn5ssM3qikXCmKdwd-EgvCsWxIaEHHRgWAEZBrpwsj9VfTtku31ZdqCEG7ZGyMThhJ7l7LfbO6ANvmWB8263-9554TxqQQdz1cFC0hZ0mJ4UrV0JfYxWFfb6Oa_jt_YR9eMRdbdb1aUcsnp50QTT2bgE3zqpbgxPtir48R2GKLhARzval8_nn063ODLxg_mnPvMUcewjywbCWkNjBMRPKiL3n0yqRAJyTlkDV4WkJfRJhLjSYSNrP1ybRBk6Juzjasi0Vjfarku4tTbRVHvCRkOz7bN9UvFfjTpOZJRhQnCfa4uxK2GgbRErg7wJDxLGFCuEQCxjQu-AfNxkZMTBIKVoZQspYYYvlnPchDsB2yC4RaE1bt5BTec-fIArTVzNbTCe--HExpSh0sS1DWNUuq7x_sfq5hwG-DBrZ1XfFVMkcOWPIEKtqzEeTGcBLFHrBUar_VB5LS8jzlDFXu_Vk5Sy6vHFtMRCi_fW8rAQG2xM5PWEC2p5RR6j0FBhwpg1zrc_)

---

## 📁 Monorepo Directory Structure

The project is managed with **Turbo** and **pnpm**, with containerization and orchestration files separated in the `infra/` folder.

```
my-app/                         # Workspace Root & Frontend
├── app/                        # Next.js App Router (Pages, layouts, hooks, utils)
├── components/                 # Shared React Components (Header, Hero, ProductGrid, etc.)
├── context/                    # Global React Context Providers (Auth, Cart, Currency, etc.)
├── lib/                        # Shared libraries
├── public/                     # Static assets (images, icons)
├── docs/                       # Technical & Operations Documentation Guides
│   ├── frontend.md             # Next.js frontend architecture and state management
│   ├── backend.md              # Express backend API, services, and auth mappings
│   ├── database.md             # Database schemas, table models, and ORM cycles
│   ├── environments.md         # Environments setup, configs, and secret variables
│   └── devops.md               # Containerization, Kubernetes, and CI/CD pipelines
├── backend/                    # Backend Workspace (Sub-project)
├── infra/                      # Infrastructure & DevOps Deployment Configuration
├── package.json                # Root package.json with workspaces & monorepo scripts
├── tsconfig.json               # Root TypeScript configuration (excludes backend/infra)
├── turbo.json                  # Turborepo build caching configuration
└── .dockerignore               # Docker build exclusions
```

---

## 📖 Documentation Index & Guides

For detailed engineering and deployment workflows, please refer to the following specialized guides:

### 0. 🚀 [Getting Started & Onboarding Guide](file:///e:/program/Next.js/my-app/docs/getting-started.md)
*   **Complete Step-by-Step Setup**: Code checkout, environment variables config, database setups.
*   **Running the Project**: Instructions for running locally, in Docker, or in Kubernetes.
*   **Daily Development Workflow**: Guides for changing code, updating DB schemas, and deploying updates.

### 1. 🎨 [Frontend Architecture & Workflow](file:///e:/program/Next.js/my-app/docs/frontend.md)
*   **Next.js 16 App Router Layouts**: Design rules and folder layout guide.
*   **Global Context States**: Detailed breakdowns of `AuthProvider`, `CartProvider`, `CurrencyProvider`, `SocketProvider`, and `ToastProvider`.
*   **API client integrations**: tRPC wrapper setups, auth-client instances, and custom fetch hooks.
*   **Styling**: Tailwind CSS v4, Lucide icons, transitions, and hover micro-animations.

### 2. ⚡ [Backend Services & API Workflows](file:///e:/program/Next.js/my-app/docs/backend.md)
*   **tRPC Procedures**: Dynamic query/mutation structures.
*   **Express Routes**: REST routers, uploads configuration, and health endpoints.
*   **Better Auth Server Integration**: Mount handlers, session encryption keys, and providers.
*   **Socket.io WebSockets**: Dynamic rooms and real-time client notification systems.

### 3. 🗄️ [Database Schemas & ORM Management](file:///e:/program/Next.js/my-app/docs/database.md)
*   **E-R Models & Relationships**: Schema columns, constraints, and tables (users, products, variants, reviews, orders, order items).
*   **Drizzle ORM Configuration**: Connection pooling, prepare settings, and DB client initializations.
*   **Migrations & Seed Scripts**: Detailed Drizzle CLI commands (`db:generate`, `db:push`, `db:seed`, and `db:studio`).
*   **Storage & Backups**: Volumes persistence and recovery strategies.

### 4. 🌐 [Multi-Environment Configuration](file:///e:/program/Next.js/my-app/docs/environments.md)
*   **Environment Layouts**: Native Host Dev vs. Docker Compose vs. Production Kubernetes.
*   **Master Variables Reference Tables**: Required flags, default settings, and descriptions for all frontend and backend parameters.
*   **Secret Management**: Kubernetes Opaque secret configurations and creation instructions.

### 5. 🐋 [DevOps, Containerization & CI/CD Pipelines](file:///e:/program/Next.js/my-app/docs/devops.md)
*   **Multi-Stage Dockerfiles**: Multi-stage compilers for frontend and backend containers.
*   **Local Orchestration**: Multi-container Compose networks and database health gates.
*   **Kubernetes Cluster Deployment**: Deployments, services, PersistentVolumeClaims, and ingress rules.
*   **GitOps CI/CD Process**: Push-to-production lifecycle mapping out unit tests, registry pushes, rolling rollouts, and automatic migrations.
