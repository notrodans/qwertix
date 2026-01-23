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
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_RESULT_HASH_SALT
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_RESULT_HASH_SALT=$VITE_RESULT_HASH_SALT

COPY . .
RUN bun run --filter frontend build

FROM nginx:alpine
COPY --from=builder /usr/src/app/apps/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80