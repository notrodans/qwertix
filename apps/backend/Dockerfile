FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY libs/room-contracts/package.json ./libs/room-contracts/
COPY libs/tsconfig/package.json ./libs/tsconfig/
RUN bun install

# Build the app
FROM deps AS builder
COPY . .
RUN bun run --filter backend build

# Production image
FROM base AS runner
ENV NODE_ENV=production

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY libs/room-contracts/package.json ./libs/room-contracts/
COPY libs/tsconfig/package.json ./libs/tsconfig/
RUN bun install --production

COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/libs ./libs
COPY --from=builder /usr/src/app/apps/backend/src ./apps/backend/src
COPY --from=builder /usr/src/app/apps/backend/drizzle ./apps/backend/drizzle
COPY --from=builder /usr/src/app/apps/backend/drizzle.config.ts ./apps/backend/drizzle.config.ts

WORKDIR /usr/src/app/apps/backend
EXPOSE 8764
CMD ["bun", "run", "start"]