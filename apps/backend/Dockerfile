FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY libs/room-contracts/package.json ./libs/room-contracts/
COPY libs/tsconfig/package.json ./libs/tsconfig/
RUN bun install

FROM deps AS builder
COPY . .
RUN bun run --filter backend build

FROM base AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install Doppler CLI
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && apt-get install -y doppler && \
    rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY libs/room-contracts/package.json ./libs/room-contracts/
COPY libs/tsconfig/package.json ./libs/tsconfig/
RUN bun install --production --ignore-scripts

COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/libs ./libs
COPY --from=builder /usr/src/app/apps/backend/drizzle ./apps/backend/drizzle
COPY --from=builder /usr/src/app/apps/backend/drizzle.config.ts ./apps/backend/drizzle.config.ts
COPY --from=builder /usr/src/app/apps/backend/src ./apps/backend/src
COPY --from=builder /usr/src/app/apps/backend/entrypoint.sh ./apps/backend/entrypoint.sh

WORKDIR /usr/src/app/apps/backend
RUN chmod +x ./entrypoint.sh

EXPOSE 3009
ENTRYPOINT ["./entrypoint.sh"]
CMD ["bun", "run", "start"]