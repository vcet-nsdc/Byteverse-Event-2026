# 29 — Deployment
**Purpose:** Document deployment configuration  
**Audience:** DevOps  
**Last Generated:** 2026-08-31  
**Source of Truth:** `Dockerfile`, `docker-compose.yml`
---
## Docker Compose (Development/Event Day)
`docker-compose.yml` defines 4 services:
| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | postgres:16-alpine | 5433:5432 | Database |
| redis | redis:7-alpine | 6379:6379 | Cache/PubSub |
| judge0 | judge0/judge0:1.13.1 | 2358:2358 | Code execution |
| app | Built from Dockerfile | 3000:3000 | Application |
## Dockerfile
```dockerfile
# Multi-stage build (details in Dockerfile)
# Copies source, installs deps, builds Next.js, runs production server
```
## Production Build
```bash
npm run build    # Creates .next/ production bundle
npm run start    # Starts Next.js production server
```
## Database Migrations
```bash
npm run db:migrate       # Deploy pending migrations
npm run db:migrate:dev   # Create new migration in development
```
## Environment-Specific Settings
| Setting | Development | Production |
|---------|-------------|------------|
| DATABASE_URL | localhost:5433 | Container postgres:5432 |
| REDIS_URL | localhost:6379 | Container redis:6379 |
| JUDGE0_URL | LAN IP:2358 | Container judge0:2358 |
| NODE_ENV | development | production |
| Round active check | Bypassed | Enforced |
## CI/CD
> **Status:** No CI/CD pipeline configured. GitHub Actions directory exists (`.github/`) but may be empty or minimal.
