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
