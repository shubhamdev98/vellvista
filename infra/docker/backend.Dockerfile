# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package structures and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Install backend dependencies with pnpm store cache
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --filter backend... --prefer-offline

# Copy backend source code
COPY backend ./backend

# Build the backend typescript project
RUN pnpm --filter backend run build

# Prune dev dependencies for lean production runner copy
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --prod --frozen-lockfile --filter backend

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backenduser

# Copy package configuration and compiled code
COPY package.json ./
COPY backend/package.json ./backend/
COPY backend/drizzle.config.ts ./backend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/drizzle ./backend/drizzle
COPY --from=builder /app/backend/src/schema.ts ./backend/src/schema.ts

# Copy and prepare the entrypoint script
COPY infra/docker/backend-entrypoint.sh /app/backend-entrypoint.sh
RUN chmod +x /app/backend-entrypoint.sh && \
    chown -R backenduser:nodejs /app

USER backenduser

EXPOSE 3001

ENTRYPOINT ["/app/backend-entrypoint.sh"]

