# syntax=docker/dockerfile:1

# 1. Base setup
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# 2. Dependencies
FROM base AS deps
# Copy root files
COPY package.json bun.lock ./

# Copy workspace manifests
# We copy explicitly to cache dependency installation step
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY libs/room-contracts/package.json ./libs/room-contracts/
COPY libs/tsconfig/package.json ./libs/tsconfig/

# Install dependencies including devDependencies (needed for build)
RUN bun install

# 3. Builder - Builds the specific app
FROM deps AS builder
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_RESULT_HASH_SALT
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_RESULT_HASH_SALT=$VITE_RESULT_HASH_SALT
# Copy source code
COPY . .
# Build all apps
RUN  bun run build

# 4. Backend Runtime
FROM base AS backend
ENV NODE_ENV=production
# Copy workspace definitions
COPY package.json bun.lock ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY libs/room-contracts/package.json ./libs/room-contracts/
COPY libs/tsconfig/package.json ./libs/tsconfig/

# Install production dependencies (including native modules)
RUN bun install --production

# Copy libs source (needed for workspace links)
COPY --from=builder /usr/src/app/libs ./libs

# Copy built app
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /usr/src/app/apps/backend/drizzle ./apps/backend/drizzle
COPY --from=builder /usr/src/app/apps/backend/src ./apps/backend/src
COPY --from=builder /usr/src/app/apps/backend/drizzle.config.ts ./apps/backend/drizzle.config.ts

WORKDIR /usr/src/app/apps/backend

CMD ["bun", "run", "start"]

# 5. Frontend Runtime
FROM nginx:alpine AS frontend
# Copy built static files
COPY --from=builder /usr/src/app/apps/frontend/dist /usr/share/nginx/html
# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
