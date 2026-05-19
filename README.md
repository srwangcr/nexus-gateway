# 🚀 Nexus Gateway (English)

> High-performance API Gateway with rate limiting, authentication, and reverse proxy.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 📋 Description

**Nexus Gateway** is a lightweight and extensible API Gateway built with Node.js and TypeScript. It acts as a single entry point for microservices, providing:

- 🔐 **JWT Authentication** — Token validation and access control with validation caching in Redis
- ⚡ **Rate Limiting** — Traffic control with `express-rate-limit` and `rate-limit-redis`
- 🔄 **Reverse Proxy** — Smart routing to backend services with retries and exponential backoff
- 📊 **Redis Integration** — JWT validation cache, rate-limit counters and shared storage
- 🚀 **PM2 Cluster** — Gateway processes scale with available cores inside the container
- 🛡️ **Error Handling** — Consistent responses and centralized logging
- 💚 **Health Check** — `/health` endpoint for monitoring and Docker `HEALTHCHECK`

---

## ✅ Quick Start

### 1) Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at least `JWT_SECRET`:

```dotenv
JWT_SECRET=my_super_secret_key_123
```

See `.env.example` for all available variables (`GATEWAY_TIMEOUT`, `GATEWAY_RETRIES`, `RATE_LIMIT_FAIL_OPEN`, etc.).

### 2) Start the gateway with Docker

```bash
sudo docker compose up --build
```

The gateway container starts with PM2 in cluster mode, so it can use the available cores on the host/LXC.

### 3) Verify the health check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{ "status": "ok", "redis": "connected", "timestamp": "2026-01-15T12:00:00.000Z" }
```

### 4) Generate a JWT token

```bash
node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({ sub:'user-1', email:'user@example.com', role:'admin', permissions:['*'] }, process.env.JWT_SECRET || 'una_clave_super_secreta_123', { expiresIn: '1h' }))"
```

### 5) Call a protected endpoint

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/users
```

Notes:

- Routes and targets are configured in `src/config/gateway.ts`.
- Undefined paths return `{"statusCode":404,"message":"Ruta no encontrada"}`.

### 6) Run tests

```bash
npm test
```

### 7) Build locally

```bash
npm run build
```

---


---

## 📊 Benchmarks & Performance Tests

Stress and performance tests were executed using **Autocannon** from an external host machine targeting the Gateway deployed inside an isolated container within a local **Proxmox Virtual Environment (PVE)**.

### 🔌 Test Environment
- **Server (Proxmox LXC):** Debian 12 (Variable Cores / 2 GiB RAM)
- **Infrastructure:** Docker Compose (Gateway, Redis 7-alpine, Users-Service)
- **Payload:** Protected `/api/users` endpoint intercepted by JWT cryptographic signature validation middleware (`jsonwebtoken`).
- **Network Injection:** Direct TCP sockets over local static routing via `vmbr0` bridge.

---

### 📈 Scaling History & Results

#### 🛑 Phase 1: Single-Thread Saturation (Resource Starvation)
- **LXC Configuration:** 1 Core vCPU, 512 MiB RAM.
- **Command:** `autocannon -c 100 -d 10`
- **Behavior:** Lacking parallel compute resources, the single-threaded Node.js event loop pinned at 100% CPU attempting to calculate token signatures. The container's network stack exhausted file descriptors, causing immediate connection rejections.
- **Result:** Complete drop to 0 RPS with mixed failures (`401`/`502` or connection timeouts).

#### 🛡️ Phase 2: Controlled Concurrency (Stable Sweet Spot)
- **LXC Configuration:** Scaled to **4 Cores vCPU**, 2 GiB RAM.
- **Command:** `autocannon -c 40 -d 10`
- **Metrics:**
  - **Average RPS:** 312.4 Req/Sec
  - **Mean Latency:** 127.42 ms
  - **Errors (Non-2xx):** 0
- **Behavior:** 100% flawless stability. The `nexus-gateway` container hovered predictably between 46% and 56% CPU usage, the underlying microservice processed comfortably at 17%, and Redis remained flat at 1.8%. Upon completion, CPU dropped instantly to 0.00% with no leaking sockets.

#### 🚀 Phase 3: High Sustained Throughput
- **LXC Configuration:** 4 Cores vCPU, 2 GiB RAM.
- **Command:** `autocannon -c 60 -d 10`
- **Metrics:**
  - **Average RPS:** 559.8 Req/Sec
  - **Mean Latency:** 177.34 ms
  - **Errors (Non-2xx):** 0
- **Behavior:** Real transfer throughput doubled. The Gateway cleanly scaled up to **151.72% CPU**, leveraging Node's internal `libuv` network threads spread across the additional cores provided by Proxmox. The backend users-service scaled up to 41% CPU to handle the load.

#### 🔥 Phase 4: Maximum Cryptographic Ceiling (Lab Record)
- **LXC Configuration:** 4 Cores vCPU, 2 GiB RAM.
- **Command:** `autocannon -c 85 -d 10`
- **Metrics:**
  - **Average RPS:** **748.4 Req/Sec**
  - **Max Peak Throughput:** **1,114 Req/Sec**
  - **Total Processed Requests (10s):** ~7,500 successful hits.
  - **Mean Latency:** 111.45 ms *(99th Percentile: 683 ms)*
  - **Errors (Non-2xx):** 0
- **Behavior:** Massive load testing at the sheer limit of a single-instance node application. The Gateway pinned at a peak of **172.93% CPU**, while the users-service handled the proxied traffic smoothly at 51.81% CPU. The increase in maximum latency (~1.3s) highlighted the physical cryptographic overhead of synchronous signature checks under compounding concurrent requests. However, the container kernel gracefully processed all socket backlogs with zero packet drops.

---

## 🛠️ Technologies

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 18+ |
| Language | TypeScript 5.x |
| Framework | Express.js |
| Cache/Store | Redis (ioredis) |
| Proxy | http-proxy |
| Auth | jsonwebtoken |
| Rate Limit | express-rate-limit + rate-limit-redis |
| Process Manager | PM2 |
| Containers | Docker & Docker Compose |

---

## 📝 Changelog

### [1.0.0] — February 2026

- 🎉 Initial release
- 🔐 JWT authentication with required and optional middlewares
- 🔐 JWT validation cache in Redis to avoid signature verification on every request
- ⚡ Entry-point rate limiting with `express-rate-limit` and Redis store
- 🔄 Reverse proxy with retries and exponential backoff
- 📊 Singleton Redis service with automatic reconnection
- 🛡️ Centralized error handling with `AppError`
- 💚 `/health` endpoint for monitoring
- 🐳 Production-ready Docker and Docker Compose with `HEALTHCHECK`
- 🚀 PM2 cluster mode inside the gateway container
- ✅ Unit and integration tests

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Open an issue or submit a pull request.

---

## 📄 License

[MIT](LICENSE) © 2026
