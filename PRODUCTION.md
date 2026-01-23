# Production Deployment Guide

This guide describes how to deploy **Qwertix** to a production environment using **Docker Swarm**.

## Prerequisites

1.  **Docker Engine** (v24+) installed and running.
2.  **Docker Swarm** initialized (`docker swarm init`).
3.  **Doppler CLI** (optional, if using Doppler for secrets management).

## Architecture

The production stack consists of:
*   **Traefik**: Reverse proxy and load balancer (listening on port 80/443, mapped to 3006 for this setup).
*   **Postgres**: Database (v16).
*   **Backend**: Node.js API (Fastify) running in replicas.
*   **Frontend**: Nginx serving the SPA running in replicas.
*   **Adminer**: Database management tool.

## 1. Secrets Management

We use **Docker Secrets** to securely pass sensitive data to containers. Before deploying, you must create these secrets in your Swarm cluster.

You can create secrets manually or use Doppler to inject them.

### Option A: Manual Creation

Run the following commands on your Swarm manager node:

```bash
# Database Credentials
echo "your_secure_db_user" | docker secret create db_user -
echo "your_secure_db_password" | docker secret create db_password -
echo "qwertix_prod" | docker secret create db_name -

# App Secrets
echo "your_jwt_secret_key" | docker secret create jwt_secret -
echo "your_random_salt_string" | docker secret create result_hash_salt -

# Doppler Token (Optional, if using Doppler inside containers)
# echo "dp.st.xxx" | docker secret create doppler_token -
# If not using Doppler, create a dummy or skip if removed from compose
echo "" | docker secret create doppler_token - 
```

### Option B: Using Doppler (Advanced)

If you have Doppler CLI installed and configured:

```bash
doppler secrets download --no-file --format docker >> .env
# Then use the env vars to create secrets (scripting required)
```

## 2. Configuration

The main `docker-compose.yml` file is designed for production usage.

*   **Ports**:
    *   Frontend/Entrypoint (Traefik): `3006` (Mapped to container port 80).
    *   Database: `8763` (Mapped to 8763).
    *   Adminer: `8081`.
*   **Scaling**: Backend and Frontend are configured with 2 replicas by default.

## 3. Build Images

Before deploying to a Swarm cluster (especially if multi-node), images must be available in a registry or built locally on all nodes.

To build locally:

```bash
docker compose build
```

To push to a registry (required for multi-node swarm):

1.  Tag images with your registry prefix (e.g., `registry.example.com/qwertix-backend`).
2.  Update `docker-compose.yml` `image` fields.
3.  `docker compose push`.

## 4. Deploy

Deploy the stack to the Swarm:

```bash
docker stack deploy -c docker-compose.yml qwertix
```

## 5. Verification

Check the status of services:

```bash
docker service ls
docker stack ps qwertix
```

Access the application:
*   **App**: http://localhost:3006
*   **API**: http://localhost:3006/api/health
*   **Traefik Dashboard**: http://localhost:8080 (if port exposed)
*   **Adminer**: http://localhost:8081

## 6. Updates (Zero Downtime)

To update the application:

1.  Pull or rebuild new images.
2.  Run the deploy command again:

```bash
docker stack deploy -c docker-compose.yml qwertix
```

Docker Swarm will perform a rolling update (start new container -> wait for healthcheck -> stop old container).

## Troubleshooting

**Logs:**
```bash
docker service logs -f qwertix_backend
docker service logs -f qwertix_frontend
```

**Database Connection:**
If services fail to connect to DB, ensure the `db_password` secret matches what Postgres expects (Postgres uses the secret to Initialize the DB on first run). If you change the password secret later, you must update the running DB user manually via SQL.
