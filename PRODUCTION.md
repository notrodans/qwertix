# Production Deployment Guide

This guide describes how to deploy **Qwertix** to a production environment using **Docker Swarm** and **Doppler**.

We provide two configurations:
1.  **Local Swarm / Private Network**: With auto-generated self-signed SSL certificates and custom ports (3006/3443).
2.  **Public Production (Cloudflare)**: With standard ports (80/443) designed to sit behind a proxy like Cloudflare (Full SSL).

## Prerequisites

1.  **Docker Engine** (v24+) installed and running.
2.  **Docker Swarm** initialized (`docker swarm init`).
3.  **Doppler CLI** installed locally (`brew install dopplerhq/cli/doppler` or equivalent).
4.  **Doppler Account**: Project and Config created in the Doppler dashboard.

## Architecture

The production stack consists of:
*   **Traefik**: Reverse proxy and load balancer with Let's Encrypt.
*   **Postgres**: Database (v18.1).
*   **Backend**: Node.js API (Fastify) running in replicas, secrets managed by Doppler.
*   **Frontend**: Bun (sirv) serving the SPA, secrets managed by Doppler.
*   **Adminer**: Database management tool.

## 1. SSL Certificates (Let's Encrypt)

We use Let's Encrypt for automatic certificate management.

### Prerequisites for SSL
*   A public domain with A/AAAA records pointing to your server.
*   Ports 80 and 443 must be open and reachable from the internet.

Traefik is configured to use the `letsencrypt` certresolver with the `httpChallenge`. Certificates are stored in the `traefik-certificates` volume.

## 2. Secrets Management

We use **Doppler** as the single source of truth for all secrets (Database, JWT, Salts). Docker Swarm only needs to know the `doppler_token`.

### Setup Docker Secrets

Run the following commands on your Swarm manager node to setup required secrets:

```bash
# Doppler token (for Backend/Frontend)
echo "dp.st.your_service_token" | docker secret create doppler_token -

# Database credentials (for Postgres)
echo "your_db_user" | docker secret create db_user -
echo "your_db_password" | docker secret create db_password -
echo "your_db_name" | docker secret create db_name -
```

### Required Variables in Doppler

Ensure your Doppler config contains the following (fetched by the application at runtime):
*   `DATABASE_URL`: Full connection string for the backend.
*   `JWT_SECRET`: Secret for authentication.
*   `RESULT_HASH_SALT`: Salt for result verification.

## 2. Build and Deploy

For local development with Swarm, we use a **local Docker registry** (on port 5000) to ensure images are correctly updated across the cluster.

### Scenario A: Local Swarm (Auto SSL)

This configuration uses Let's Encrypt. Note that for ACME to work, your local machine must be reachable from the internet, or you should use a tool like `ngrok` or `cloudflare tunnel`.

1.  **Start Local Registry**:
    ```bash
    docker compose -f docker-compose.stack.local.yml up -d registry
    ```

2.  **Build and Push** images to the local registry:
    ```bash
    docker compose -f docker-compose.stack.local.yml build
    docker compose -f docker-compose.stack.local.yml push
    ```

3.  **Deploy**:
    ```bash
    docker stack deploy -c docker-compose.stack.local.yml qwertix
    ```

### Scenario B: Public Production

1.  **Build**:
    ```bash
    doppler run -- docker compose -f docker-compose.stack.yml build
    ```

2.  **Deploy**:
    ```bash
    doppler run -- docker stack deploy -c docker-compose.stack.yml qwertix
    ```

## 3. Verification

Check the status of services:

```bash
docker service ls
docker stack ps qwertix
```

## 4. Updates (Zero Downtime)

To update the application:

1.  Update secrets in the Doppler Admin Panel (if needed).
2.  Rebuild and redeploy. Docker Swarm will perform a rolling update.

```bash
doppler run -- docker stack deploy -c docker-compose.stack.local.yml qwertix
```

## Troubleshooting

**Logs:**
```bash
docker service logs -f qwertix_backend
docker service logs -f qwertix_frontend
```

**Doppler Issues:**
If a container fails to start, check if the `doppler_token` secret is correctly mounted. The `docker-entrypoint.sh` will log an error if the token is missing or invalid.