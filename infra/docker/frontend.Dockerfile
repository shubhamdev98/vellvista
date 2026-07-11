# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# Copy package configurations
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including build devDependencies)
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY . .

# Set environment variables for Next.js build-time configuration
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

# Build the Next.js production bundle
RUN pnpm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm

# Copy only the configuration files and compiled app bundles
COPY package.json pnpm-lock.yaml next.config.ts postcss.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Install production dependencies only
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]
