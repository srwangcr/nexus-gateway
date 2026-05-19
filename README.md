# 🚀 Nexus Gateway

> API Gateway de alto rendimiento con rate limiting, autenticación y reverse proxy.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 📋 Descripción

**Nexus Gateway** es un API Gateway ligero y extensible construido con Node.js y TypeScript. Actúa como punto de entrada único para microservicios, proporcionando:

- 🔐 **Autenticación JWT** — Validación de tokens y control de acceso con cache de validación en Redis
- ⚡ **Rate Limiting** — Control de tráfico con `express-rate-limit` y `rate-limit-redis`
- 🔄 **Reverse Proxy** — Enrutamiento inteligente a servicios backend con reintentos y backoff exponencial
- 📊 **Redis Integration** — Cache de validaciones JWT, contadores de rate limit y almacenamiento compartido
- 🚀 **PM2 Cluster** — Ejecución del gateway por núcleo disponible dentro del contenedor
- 🛡️ **Manejo de Errores** — Respuestas consistentes y logging centralizado
- 💚 **Health Check** — Endpoint `/health` para monitoreo y Docker `HEALTHCHECK`

---

## 🏗️ Arquitectura

```
┌─────────────┐     ┌─────────────────────────────────────────┐     ┌──────────────┐
│   Cliente   │────▶│             NEXUS GATEWAY               │────▶│  Servicios   │
└─────────────┘     │  ┌─────┐ ┌──────┐ ┌───────┐ ┌───────┐  │     │   Backend    │
                    │  │Auth │▶│Rate  │▶│Proxy  │▶│Error  │  │     ├──────────────┤
                    │  │     │ │Limit │ │       │ │Handler│  │     │ Users API    │
                    │  └─────┘ └──────┘ └───────┘ └───────┘  │     │ Products API │
                    │              │                          │     │ Orders API   │
                    │              ▼                          │     └──────────────┘
                    │         ┌───────┐                       │
                    │         │ Redis │                       │
                    │         └───────┘                       │
                    └─────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
nexus-gateway/
├── src/
│   ├── app.ts                        # Punto de entrada principal
│   ├── config/
│   │   ├── gateway.ts                # Configuración de rutas y servicios
│   │   └── redis.ts                  # Configuración de conexión Redis
│   ├── core/
│   │   ├── algorithms/
│   │   │   └── rate-limit.logic.ts   # Algoritmos Token Bucket & Sliding Window
│   │   └── interfaces/
│   │       └── request.interface.ts  # Tipos e interfaces TypeScript
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # Autenticación, autorización y cache JWT
│   │   ├── error.handler.ts          # Manejo centralizado de errores
│   │   └── rate-limit.middleware.ts  # Rate limiting con Redis
│   ├── proxy/
│   │   └── reverse-proxy.ts         # Lógica del reverse proxy
│   └── services/
│       └── redis.service.ts         # Cliente Redis (singleton)
├── utils/
│   ├── integration/                  # Tests de integración
│   └── unit/                         # Tests unitarios
├── .env.example                      # Ejemplo de variables de entorno
├── docker-compose.yml
├── Dockerfile
├── LICENSE
├── tsconfig.json
└── README.md
```

---

## ✅ Uso rápido

### 1) Configura variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y define al menos `JWT_SECRET`:

```dotenv
JWT_SECRET=una_clave_super_secreta_123
```

Consulta `.env.example` para ver todas las variables disponibles (`GATEWAY_TIMEOUT`, `GATEWAY_RETRIES`, `RATE_LIMIT_FAIL_OPEN`, etc.).

### 2) Levanta el gateway con Docker

```bash
sudo docker compose up --build
```

El contenedor del gateway arranca con PM2 en modo cluster, por lo que aprovecha los cores disponibles del host/LXC.

### 3) Verifica el health check

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{ "status": "ok", "redis": "connected", "timestamp": "2026-01-15T12:00:00.000Z" }
```

### 4) Genera un token JWT

```bash
node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({ sub:'user-1', email:'user@example.com', role:'admin', permissions:['*'] }, process.env.JWT_SECRET || 'una_clave_super_secreta_123', { expiresIn: '1h' }))"
```

### 5) Prueba un endpoint protegido

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/users
```

Notas:

- Las rutas y destinos se configuran en `src/config/gateway.ts`.
- Si visitas una ruta no definida, recibirás `{"statusCode":404,"message":"Ruta no encontrada"}`.

### 6) Ejecuta los tests

```bash
npm test
```

### 7) Build local

```bash
npm run build
```

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|-----------|
| Runtime | Node.js 18+ |
| Lenguaje | TypeScript 5.x |
| Framework | Express.js |
| Cache/Store | Redis (ioredis) |
| Proxy | http-proxy |
| Auth | jsonwebtoken |
| Rate Limit | express-rate-limit + rate-limit-redis |
| Process Manager | PM2 |
| Contenedores | Docker & Docker Compose |

---

## 📝 Changelog

### [1.0.0] — Febrero 2026

- 🎉 Release inicial
- 🔐 Autenticación JWT con middleware obligatorio y opcional
- 🔐 Cache de validación JWT en Redis para evitar verificar la firma en cada request
- ⚡ Rate limiting de entrada con `express-rate-limit` y store Redis
- 🔄 Reverse proxy con reintentos y backoff exponencial
- 📊 Servicio Redis singleton con reconexión automática
- 🛡️ Manejo centralizado de errores con `AppError`
- 💚 Endpoint `/health` para monitoreo
- 🐳 Docker y Docker Compose listos para producción con `HEALTHCHECK`
- 🚀 PM2 en modo cluster dentro del contenedor del gateway
- ✅ Tests unitarios y de integración

---

## 🤝 Contribución

Las contribuciones, issues y feature requests son bienvenidos. Abre un issue o envía un pull request.

---

## 📄 Licencia

[MIT](LICENSE) © 2026

---

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
JWT_SECRET=una_clave_super_secreta_123
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
