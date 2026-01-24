# Production Deployment Guide

This guide describes how to deploy **Qwertix** to a production environment using **Docker Swarm**.

We provide two configurations:
1.  **Local Swarm / Private Network**: With auto-generated self-signed SSL certificates and custom ports (3006/3443).
2.  **Public Production (Cloudflare)**: With standard ports (80/443) designed to sit behind a proxy like Cloudflare (Full SSL).

## Prerequisites

1.  **Docker Engine** (v24+) installed and running.
2.  **Docker Swarm** initialized (`docker swarm init`).
3.  **Doppler CLI** (optional, if using Doppler for secrets management).

## Architecture

The production stack consists of:
*   **Traefik**: Reverse proxy and load balancer.
*   **Postgres**: Database (v16).
*   **Backend**: Node.js API (Fastify) running in replicas.
*   **Frontend**: Nginx serving the SPA running in replicas.
*   **Cert Init** (Local only): Ephemeral container to generate self-signed certificates.
*   **Adminer**: Database management tool.

## 1. Secrets Management

We use **Docker Secrets** to securely pass sensitive data to containers. Before deploying, you must create these secrets in your Swarm cluster.

### Manual Creation

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

## 2. Choose Your Configuration

### Scenario A: Local Swarm / Private Network
Use `docker-compose.stack.local.yml`.
*   **Ports**: HTTP on `3006`, HTTPS on `3443`.
*   **SSL**: Automatically generates self-signed certificates for `localhost`, `127.0.0.1`, and `0.0.0.0`.
*   **Use case**: Testing production build locally, accessing from mobile devices in LAN via IP.

### Scenario B: Public Production (e.g., Cloudflare)
Use `docker-compose.stack.yml`.
*   **Ports**: Standard HTTP (`80`) and HTTPS (`443`).
*   **SSL**: Expects external SSL termination or valid certificates provided manually (Cloudflare Origin CA).
*   **Use case**: VPS deployment behind Cloudflare Proxy or Tunnel.

## 3. Build Images

Before deploying to a Swarm cluster (especially if multi-node), images must be available in a registry or built locally on all nodes.

```bash
docker compose build
# Or push to registry
# docker compose push
```

## 4. Deploy

### For Local Swarm (Auto SSL):

```bash
docker stack deploy -c docker-compose.stack.local.yml qwertix
```

### For Public Production:

```bash
docker stack deploy -c docker-compose.stack.yml qwertix
```

## 5. Verification

Check the status of services:

```bash
docker service ls
docker stack ps qwertix
```

Access the application:

**Local Stack:**
*   **HTTP**: `http://<IP>:3006` (e.g., http://localhost:3006 or http://192.168.1.5:3006)
*   **HTTPS**: `https://<IP>:3443` (accept the "Not Secure" warning for self-signed certs)
*   **Adminer**: `http://<IP>:8081`

**Public Stack:**
*   **Web**: `http(s)://your-domain.com` (Ports 80/443)

## 6. Updates (Zero Downtime)

To update the application:

1.  Pull or rebuild new images.
2.  Run the deploy command again with the same compose file.

Docker Swarm will perform a rolling update (start new container -> wait for healthcheck -> stop old container).

## Troubleshooting

**Logs:**
```bash
docker service logs -f qwertix_backend
docker service logs -f qwertix_frontend
docker service logs -f qwertix_traefik
```

**DNS Issues in Swarm:**
We use `qwertix_db` as the hostname. Ensure overlay networks are working correctly.

**HTTPS Warning:**
On the local stack, it is normal to see "Not Secure" because the certificate is self-signed. You can import the certificate from the `qwertix_traefik` container to your trusted root if needed.
