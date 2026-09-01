# Byteverse 2026 — Azure VM Deployment Guide

## Prerequisites

- Azure VM: Standard D4s v3 (4 vCPU, 16 GB RAM) minimum
- OS: Ubuntu 22.04 LTS
- OS disk: 128 GB (Judge0 Docker images are large)
- Static public IP + DNS A record
- NSG: allow 80, 443, 22 (restrict SSH to your IP); block 5432, 6379, 2358 from public

---

## 1. Initial server setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. Clone and configure

```bash
git clone <repo-url> /opt/byteverse
cd /opt/byteverse

# Create env file from template
cp .env.example .env
nano .env   # Fill in ALL values — no defaults remain for secrets
```

Generate secrets:
```bash
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -hex 32      # JUDGE0_WEBHOOK_SECRET
openssl rand -base64 24   # POSTGRES_PASSWORD
openssl rand -base64 24   # JUDGE0_DB_PASSWORD
openssl rand -base64 24   # REDIS_PASSWORD
```

---

## 3. Nginx reverse proxy

```nginx
# /etc/nginx/sites-available/byteverse
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # SSE support (leaderboard / admin streams)
        proxy_buffering off;
        proxy_read_timeout 3600s;
    }

    listen 80;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/byteverse /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# TLS
sudo certbot --nginx -d your-domain.com
```

---

## 4. Deploy

```bash
cd /opt/byteverse

# Build and start all services (postgres, judge0-db, redis, judge0, migrate, app)
docker compose --env-file .env up -d --build

# Verify migrations ran
docker compose logs migrate

# Verify app started
docker compose logs app

# Seed initial admin user (run once)
docker compose exec app npx prisma db seed
```

---

## 5. Set NEXTAUTH_URL

In `.env`:
```
NEXTAUTH_URL=https://your-domain.com
```

Then restart: `docker compose restart app`

---

## 6. Backups

```bash
# Daily postgres backup to Azure Blob (configure azcopy or rclone)
# Example cron: /etc/cron.d/byteverse-backup
0 3 * * * docker exec byteverse-postgres-1 pg_dump -U byteverse byteverse | gzip > /backups/byteverse-$(date +%Y%m%d).sql.gz
```

---

## 7. Updates

```bash
cd /opt/byteverse
git pull
docker compose up -d --build
# migrate service runs automatically before app starts
```

---

## Security checklist

- [ ] All secrets in `.env` are unique and not defaults
- [ ] `ADMIN_PIN` is set and known only to proctors
- [ ] Postgres, Redis, Judge0 ports NOT exposed to public (NSG + ufw)
- [ ] SSH restricted to known IPs in NSG
- [ ] TLS cert active (Certbot auto-renews)
- [ ] `NEXTAUTH_URL` matches actual domain
- [ ] `JUDGE0_WEBHOOK_SECRET` matches `CALLBACKS_URL_BEARER_TOKEN` in docker/judge0.conf (handled automatically via compose env)
