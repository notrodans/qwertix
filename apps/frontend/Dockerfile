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
RUN bun run --filter frontend build

FROM oven/bun:1-slim AS runner
WORKDIR /usr/src/app

# Install Doppler CLI
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && apt-get install -y doppler && \
    rm -rf /var/lib/apt/lists/*

# Install sirv-cli
RUN bun add -g sirv-cli

COPY --from=builder /usr/src/app/apps/frontend/dist ./dist
COPY --from=builder /usr/src/app/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["bun", "x", "sirv", "dist", "--port", "80", "--single", "--host"]
