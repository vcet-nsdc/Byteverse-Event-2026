# ByteVerse 2026 — Production Split Deployment Architecture

This document describes the production deployment architecture for ByteVerse 2026:
- **Frontend & API:** Hosted on **Vercel** (`https://byteverse-testing-platform-26.vercel.app`)
- **Execution & Database Engine:** Hosted on **Azure Virtual Machine** (`13.70.5.64`)

---

## 1. Architecture Overview

```
[ Participants / Admin Browsers ]
               │
               ▼
   [ Vercel Edge / Serverless ]
               │
       ┌───────┴─────────────────────────┐
       ▼ (Port 5433)                     ▼ (Port 2358)
[ Azure VM: PostgreSQL ]          [ Azure VM: Judge0 Engine ]
 (Competition DB: byteverse)       (Docker isolate / compilation)
       ▲                                 ▲
       │                                 │
[ Azure VM: Redis (Port 6379) ] ◄────────┘
 (Job Queues & SSE Pub/Sub)
```

---

## 2. Azure VM Services (`docker-compose.judge0.yml`)

The Azure VM runs only the 4 backend execution and state services:
1. **`postgres`** — Port `5433` (`0.0.0.0:5433->5432`)
2. **`redis`** — Port `6379` (`0.0.0.0:6379->6379`)
3. **`judge0-db`** — Internal Postgres database for Judge0
4. **`judge0`** — Port `2358` (`0.0.0.0:2358->2358`)

### Commands to Run on Azure VM:

```bash
cd ~/byteverse
git pull origin main

# Stop any legacy full stack containers:
sudo docker compose down

# Start the dedicated backend services:
sudo docker compose -f docker-compose.judge0.yml up -d

# Verify all 4 containers are healthy:
sudo docker compose -f docker-compose.judge0.yml ps
```

### Ensure Required Symlink in Judge0:
```bash
sudo docker exec -u 0 -it byteverse-judge0-1 ln -s /var/local/lib/isolate/0/box /box
```

---

## 3. Azure Networking (NSG) Inbound Rules

Ensure rule `ByteVerse_Services` allows the following inbound ports to destination `Any`:
- `22` (SSH)
- `2358` (Judge0 Code Engine)
- `5433` (PostgreSQL Database)
- `6379` (Redis Cache & Queue)

---

## 4. Vercel Environment Variables

Set these environment variables in your Vercel Project Settings (**Settings** → **Environment Variables**):

| Variable | Value |
|:---|:---|
| `DATABASE_URL` | `postgresql://byteverse:BJtus6WFdza8fRGKM7ADPIr21j3nYvpL@13.70.5.64:5433/byteverse?sslmode=disable` |
| `REDIS_URL` | `redis://:3AhY47QFgiScfRDIuXKVUGjztOPo6aNb@13.70.5.64:6379` |
| `JUDGE0_URL` | `http://13.70.5.64:2358` |
| `JUDGE0_API_KEY` | `nsJLGeoqB1du7Yj5CkQpKw6mNtEUW3b8` |
| `JUDGE0_WEBHOOK_SECRET` | `MNVlhg2iJqhVGQNhk+Jp0L5QliXRNLjexiTOhQY2OaI=` |
| `NEXTAUTH_URL` | `https://byteverse-testing-platform-26.vercel.app` |
| `NEXTAUTH_SECRET` | `5c6436ba4df746e4b6d4ee2ea439b1a55502c388a107ef46c24090b84c8a29a0` |
| `ADMIN_PIN` | `2026` |
| `ADMIN_INVITE_TOKEN` | `bv2026-admin-nsdc-key` |
| `AI_PROVIDER` | `groq` |
| `GROQ_API_KEY` | *(Your primary Groq API key)* |
| `GROQ_API_KEY_FALLBACK` | *(Your backup Groq API key)* |

> **IMPORTANT:** After editing any environment variable on Vercel, navigate to the **Deployments** tab, click **`...`** on the latest deployment, and click **Redeploy** to apply changes.

---

## 5. Known Linux Kernel & Cgroups Notes

- **Ubuntu 24.04 (Kernel >= 6.8 / 6.17):**
  Linux kernel 6.8+ permanently deprecated legacy cgroup v1 memory controllers (`/sys/fs/cgroup/memory`). 
  [`docker/judge0.conf`](docker/judge0.conf) has `DISABLE_CGROUPS=true` configured to bypass per-sandbox memory accounting.
- **Guaranteed Production Stability:**
  For 100% native kernel-enforced sandboxing, run an Azure VM with **Ubuntu 22.04 LTS** (Kernel <= 5.15), where cgroups v1 is natively supported by the Linux kernel.

---

## 6. Verification Tests

### Test 1: Database Reachability
```bash
# On your local machine or serverless:
npx tsx -e "import { Pool } from 'pg'; const p = new Pool({ connectionString: 'postgresql://byteverse:BJtus6WFdza8fRGKM7ADPIr21j3nYvpL@13.70.5.64:5433/byteverse?sslmode=disable' }); p.query('SELECT 1').then(r => console.log('DB OK:', r.rows));"
```

### Test 2: Judge0 Health
```bash
curl -i -H "X-Auth-Token: nsJLGeoqB1du7Yj5CkQpKw6mNtEUW3b8" http://13.70.5.64:2358/system_info
```

### Test 3: Remote Code Compilation
```bash
curl -X POST "http://13.70.5.64:2358/submissions?base64_encoded=false&wait=true" \
  -H "Content-Type: application/json" \
  -H "X-Auth-Token: nsJLGeoqB1du7Yj5CkQpKw6mNtEUW3b8" \
  -d '{"source_code": "print(\"ByteVerse Online\")", "language_id": 71}'
```
