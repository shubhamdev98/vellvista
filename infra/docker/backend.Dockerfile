# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# Copy package structures and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Install all dependencies (including devDependencies like typescript)
RUN pnpm install --frozen-lockfile

# Copy backend source
COPY backend ./backend

# Build the backend typescript project
RUN pnpm --filter backend run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm

# Copy package configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY backend/drizzle.config.ts ./backend/

# Copy compiled assets from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/drizzle ./backend/drizzle
COPY --from=builder /app/backend/src/schema.ts ./backend/src/schema.ts

# Install production dependencies only
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile --filter backend

# Copy and prepare the entrypoint script
COPY infra/docker/backend-entrypoint.sh /app/backend-entrypoint.sh
RUN chmod +x /app/backend-entrypoint.sh

EXPOSE 3001
ENV PORT=3001

ENTRYPOINT ["/app/backend-entrypoint.sh"]
