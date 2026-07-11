# VellVista Environment Configuration & Management Guide

This document describes the environment layers, configuration files, environment variables, and secret security management procedures of the **VellVista** application.

---

## 🌐 Environment Architectures

VellVista is configured to run across three environments with distinct connection, storage, and networking layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ENVIRONMENT LIFE-CYCLES                        │
├───────────────────┬─────────────────────────────┬───────────────────────┤
│ Feature           │ Local Native (Development)  │ Local Docker Compose  │ Production (Kubernetes)│
├───────────────────┼─────────────────────────────┼───────────────────────┤
│ DB Engine         │ Host PostgreSQL / Supabase  │ Containerised Alpine  │ HA Pods / Cloud DB    │
│ Media Uploads     │ local backend/public/       │ Mapped Named Volume  │ Persistent PVC Volume │
│ Domain / Ingress  │ localhost:3000              │ localhost:3000        │ vellvista.local / DNS │
│ Secret Store      │ .env & .env.local files     │ compose environment:  │ K8s Opaque Secrets    │
└───────────────────┴─────────────────────────────┴───────────────────────┘
```

---

## 📋 Environment Variables Reference

### 1. Frontend Configs (`.env.local`)
Variables loaded by Next.js. Frontend values prefixed with `NEXT_PUBLIC_` are bundled into the client build.

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `3000` | Local port for Next.js to start. |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | `http://localhost:3001` | Express backend endpoint. |
| `NEXT_PUBLIC_SOCKET_URL` | No | `http://localhost:3001` | Socket.io server connection. |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001` | Resolve auth base address. |

---

### 2. Backend Configs (`backend/.env` / K8s configs)
Variables loaded dynamically by the Express runtime.

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `3001` | Local port for Express API. |
| `SERVER_IP` | No | `localhost` | Network IP address of backend server. |
| `DATABASE_URL` | Yes | `postgresql://...` | Connection URL for PostgreSQL. |
| `USE_SUPABASE` | No | `false` | Enable Supabase routing toggle. |
| `SUPABASE_DB` | No | `postgresql://...` | Supabase endpoint. |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | CORS authorized frontend client origin. |
| `BETTER_AUTH_SECRET` | Yes | `[random-salt]` | Cookie and JWT encryption salt (min 32 chars). |
| `BETTER_AUTH_URL` | Yes | `http://localhost:3001` | Endpoint where Auth service sits. |
| `GOOGLE_CLIENT_ID` | No | `[google-oauth-id]` | Google Social Auth login ID. |
| `GOOGLE_CLIENT_SECRET` | No | `[google-oauth-secret]`| Google Social Auth login Secret key. |
| `CLOUDINARY_CLOUD_NAME` | No | `[cloud-name]` | Account name for Cloudinary uploads. |
| `CLOUDINARY_API_KEY` | No | `[api-key]` | API Key for Cloudinary connection. |
| `CLOUDINARY_API_SECRET`| No | `[api-secret]` | API Secret for Cloudinary uploads. |
| `RAZORPAY_KEY_ID` | No | `rzp_test_...` | Payment Gateway Merchant Key ID. |
| `RAZORPAY_KEY_SECRET` | No | `[rzp-secret]` | Payment Gateway Secret key. |
| `SMTP_USER` | No | `[email]` | SMTP account username (Nodemailer notifications). |
| `SMTP_PASS` | No | `[password]` | SMTP account password. |

---

## 🔒 Secret Management Guidelines

### 1. Local Development
- Keep all local configurations in `.env` and `.env.local` files.
- **IMPORTANT**: Never commit these files to Git. They are explicitly excluded in `.gitignore`.

### 2. Docker Compose
In Docker Compose, configurations are loaded via the `environment:` config block inside `docker-compose.yml`. For development, default development-safe variables are embedded. For custom values, Docker Compose automatically reads local host `.env` files.

### 3. Production Kubernetes
Kubernetes separates config variables into **ConfigMaps** (non-sensitive) and **Secrets** (sensitive Base64 values).

#### Creating Kubernetes Secret Manifests:
1.  Base64 encode your secrets:
    ```bash
    echo -n "postgresql://postgres:password@host:5432/db" | base64
    ```
2.  Add them to the Secret data block:
    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: backend-secrets
    type: Opaque
    data:
      DATABASE_URL: [BASE64_VALUE]
      BETTER_AUTH_SECRET: [BASE64_VALUE]
    ```
3.  Alternatively, create them directly in the namespace via kubectl:
    ```bash
    kubectl create secret generic backend-secrets \
      --from-literal=DATABASE_URL="postgresql://postgres:password@host:5432/db" \
      --from-literal=BETTER_AUTH_SECRET="dev_secret_key_which_is_at_least_32_characters_long"
    ```
