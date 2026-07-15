# VellVista DevOps & Deployment Workflow Guide

This document describes the operational design, environments, containerization, local orchestration, Kubernetes manifests, and automated CI/CD pipeline structures of the **VellVista** application.

---

## 🐋 Containerization Architecture

All deployment-related assets reside in the [infra/](file:///e:/program/Next.js/my-app/infra) directory.

### 1. Dockerfiles (`infra/docker/`)

*   **Backend Dockerfile (`backend.Dockerfile`)**:
    - Uses a multi-stage compilation using `node:20-alpine` and `pnpm`.
    - Stage 1 compiles TypeScript files into `/dist/` using the global workspace dependencies.
    - Stage 2 copies the compiled assets, copies the migrations directory, and runs `pnpm install --prod` to keep container weight low.
    - It uses [backend-entrypoint.sh](file:///e:/program/Next.js/my-app/infra/docker/backend-entrypoint.sh) as its ENTRYPOINT.

*   **Backend Entrypoint Script (`backend-entrypoint.sh`)**:
    - Executed inside the container on boot.
    - Runs `npx drizzle-kit push:pg` to apply migrations/schemas to the target database before starting the Express server.

*   **Frontend Dockerfile (`frontend.Dockerfile`)**:
    - A multi-stage Next.js compilation using `node:20-alpine`.
    - Stage 1 compiles Next.js static and server bundles.
    - Stage 2 copies only compiled `.next` and `/public` directories.
    - Installs production dependencies and serves the Next.js server on port 3000.

---

## 🛠️ Local Container Orchestration (Docker Compose)

The file [infra/docker-compose.yml](file:///e:/program/Next.js/my-app/infra/docker-compose.yml) orchestrates the local dev/testing stack:

*   **`db` service**: Runs PostgreSQL 15 Alpine. Maps port `5432:5432` locally. Mounts `postgres_data` volume for persistence.
*   **`backend` service**: Builds from `backend.Dockerfile`. Depends on `db` service (healthcheck ensures the DB is ready before backend start). Maps port `3001:3001` locally. Mounts `backend_uploads` volume for review media storage.
*   **`frontend` service**: Builds from `frontend.Dockerfile` passing the API URL build-arg. Maps port `3000:3000` locally.

### Execution Command:
```bash
cd infra
docker compose up --build
```

---

## ☸️ Production Orchestration (Kubernetes)

Manifests reside inside [infra/k8s/](file:///e:/program/Next.js/my-app/infra/k8s) and are orchestrated using Kustomize:

1.  **PostgreSQL (`postgres.yaml`)**:
    - PVC `postgres-pvc` (5Gi storage).
    - Secret `postgres-credentials` (user/password/db encoded in Base64).
    - Deployment running PostgreSQL on port 5432.
    - Service `postgres` exposing database traffic internally.
2.  **Express API (`backend.yaml`)**:
    - PVC `backend-uploads-pvc` (2Gi storage for local media fallback).
    - ConfigMap `backend-config` (non-sensitive URLs/ports).
    - Secret `backend-secrets` (sensitive DB URL and session key salts).
    - Deployment running the backend (2 replicas for HA, configuring liveness/readiness probes on `/health`).
    - Service `backend` exposing port 3001 internally.
3.  **Next.js Frontend (`frontend.yaml`)**:
    - ConfigMap `frontend-config` (NEXT_PUBLIC_BACKEND_URL).
    - Deployment running the frontend (2 replicas, configuring probes on `/`).
    - Service `frontend` exposing port 3000 internally.
4.  **Ingress Routing (`ingress.yaml`)**:
    - Configures NGINX Ingress paths:
      - Routes `/trpc`, `/api/auth`, `/reviews`, `/product`, `/hero`, and `/health` to `backend` service.
      - Routes all other traffic (`/`) to `frontend` service.
    - Solves CORS configuration issues by serving all pages and API requests under a single origin (`http://vellvista.local`).
5.  **Kustomization (`kustomization.yaml`)**:
    - Maps all YAML files to deploy with a single instruction (run from the project root directory):
      ```bash
      kubectl apply -k infra/k8s/
      ```

---

## 🔄 Automated CI/CD GitOps Pipeline

When code is committed and pushed to your remote branch (e.g. GitHub `master` branch), the following lifecycle takes place:

[![CI/CD Pipeline Flow](https://mermaid.ink/img/pako:PZJNb-IwEIb_yqscOEH3zmFXkLRAoSgCVqutl4NJJsHC8UT-KEKI_76KE3odP89rz3juScElJdOktrI945D9MwAwExl9keaWLPLgzuSQcknwjIXyy3A6YjL5iblIV_jD9lJpvmIXjAO91C8Dg1nhFRt37DPnUUlFxDbKeLIY4bBHeqbi8qTSSGX3vohcOvfr0R9lmEzwl1wkXsU8KF0it1yGeA8yLi5ksWpkTc-46Gw5Km_iTSqN3hthy15VN3w3OhivkV2Ig6yHKFyVP3c9IeWmUR775WyAFxFeim5GT9ozUjZeKkMWO6qV8_bWz2V44TKcxnhNd0PIMoasREat5ltDxiPNsPfU4mBVXZOlckBXEX0Xs7bVN3xIoypyvr9TB9eN9AfyoDXYYE_267ut92iuxTqcyBry5JCTrdg2DjvWWpkav9tSehqEdRQ2YktX5FzCdt_WqNrK-KkY4cTsHUI7CJsofIiVqS05B3dVvug2x1tZVaqY4pMsI-Or8aqhYzJOGrKNVGUyvSf-TE23hyVVMmifPMaJDJ73N1MkU28DjZMQn5cmdew)](https://mermaid.live/edit#pako:PZJNb-IwEIb_yqscOEH3zmFXkLRAoSgCVqutl4NJJsHC8UT-KEKI_76KE3odP89rz3juScElJdOktrI945D9MwAwExl9keaWLPLgzuSQcknwjIXyy3A6YjL5iblIV_jD9lJpvmIXjAO91C8Dg1nhFRt37DPnUUlFxDbKeLIY4bBHeqbi8qTSSGX3vohcOvfr0R9lmEzwl1wkXsU8KF0it1yGeA8yLi5ksWpkTc-46Gw5Km_iTSqN3hthy15VN3w3OhivkV2Ig6yHKFyVP3c9IeWmUR775WyAFxFeim5GT9ozUjZeKkMWO6qV8_bWz2V44TKcxnhNd0PIMoasREat5ltDxiPNsPfU4mBVXZOlckBXEX0Xs7bVN3xIoypyvr9TB9eN9AfyoDXYYE_267ut92iuxTqcyBry5JCTrdg2DjvWWpkav9tSehqEdRQ2YktX5FzCdt_WqNrK-KkY4cTsHUI7CJsofIiVqS05B3dVvug2x1tZVaqY4pMsI-Or8aqhYzJOGrKNVGUyvSf-TE23hyVVMmifPMaJDJ73N1MkU28DjZMQn5cmdew)

### Operational Checklists for DevOps:
*   **Database Migrations**: Always executed at deployment time automatically within the backend container. If a migration fails, the container crash-loops, and Kubernetes does NOT route user traffic to it, preventing database corruption from impacting live users.
*   **Zero Downtime**: Rolling deployment ensures at least 50% capacity is maintained during app rollouts.
*   **Volume Backups**: Regular backups should capture the volumes associated with `postgres-pvc` and `backend-uploads-pvc` daily.
