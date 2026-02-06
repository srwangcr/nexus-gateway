# 🚀 Nexus Gateway

> API Gateway de alto rendimiento con rate limiting, autenticación y reverse proxy.

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 📋 Descripción

**Nexus Gateway** es un API Gateway ligero y extensible construido con Node.js y TypeScript. Actúa como punto de entrada único para microservicios, proporcionando:

- 🔐 **Autenticación JWT** - Validación de tokens y control de acceso
- ⚡ **Rate Limiting** - Control de tráfico con algoritmos Token Bucket y Sliding Window
- 🔄 **Reverse Proxy** - Enrutamiento inteligente a servicios backend
- 📊 **Redis Integration** - Almacenamiento de sesiones y contadores de rate limit
- 🛡️ **Manejo de Errores** - Respuestas consistentes y logging centralizado

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
│   ├── app.ts                    # Punto de entrada principal
│   ├── config/
│   │   ├── gateway.ts            # Configuración de rutas y servicios
│   │   └── redis.ts              # Configuración de conexión Redis
│   ├── core/
│   │   ├── algorithms/
│   │   │   └── rate-limit.logic.ts   # Algoritmos Token Bucket & Sliding Window
│   │   └── interfaces/
│   │       └── request.interface.ts  # Tipos e interfaces TypeScript
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # Autenticación y autorización
│   │   ├── error.handler.ts          # Manejo centralizado de errores
│   │   └── rate-limit.middleware.ts  # Middleware de rate limiting
│   ├── proxy/
│   │   └── reverse-proxy.ts          # Lógica del reverse proxy
│   └── services/
│       └── redis.service.ts          # Cliente Redis (singleton)
├── tests/
│   ├── integration/
│   └── unit/
├── .env.example                # Ejemplo de variables de entorno
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
└── README.md
```

---

## 🚧 Estado Actual del Proyecto

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Estructura base | ✅ Completado | Carpetas y archivos creados |
| Pseudocódigo | ✅ Completado | Lógica documentada en cada archivo |
| `redis.service.ts` | ✅ Completado | Implementación del cliente Redis |
| `auth.middleware.ts` | ✅ Completado | Implementación del middleware de autenticación |
| `rate-limit.middleware.ts` | ✅ Completado | Implementación del middleware de rate limiting |
| `reverse-proxy.ts` | ✅ Completado | Implementación de la lógica del reverse proxy |
| `error.handler.ts` | ✅ Completado | Implementación del manejador de errores |
| Docker setup | ✅ Completado | `Dockerfile` y `docker-compose.yml` configurados |
| Tests unitarios | ⏳ Pendiente | Por implementar |
| Tests de integración | ⏳ Pendiente | Por implementar |

---

## 🛠️ Tecnologías

- **Runtime:** Node.js 18+
- **Lenguaje:** TypeScript 5.x
- **Framework:** Express.js
- **Cache/Store:** Redis (ioredis)
- **Proxy:** http-proxy
- **Auth:** jsonwebtoken
- **Contenedores:** Docker & Docker Compose

---

## ✅ Uso rapido

### 1) Configura variables de entorno

Crea un archivo [.env](.env) usando [.env.example](.env.example) como base y define tu secreto:

```bash
cp .env.example .env
```

Ejemplo minimo:

```dotenv
JWT_SECRET=una_clave_super_secreta_123
```

### 2) Levanta el gateway con Docker

```bash
docker compose up --build
```

### 3) Genera un token JWT

```bash
node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({ sub:'user-1', email:'user@example.com', role:'admin', permissions:['*'] }, process.env.JWT_SECRET || 'una_clave_super_secreta_123', { expiresIn: '1h' }))"
```

### 4) Prueba un endpoint protegido

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/users
```

Notas:

- Las rutas y destinos se configuran en [src/config/gateway.ts](src/config/gateway.ts).
- Si visitas una ruta no definida, recibiras `{"statusCode":404,"message":"Ruta no encontrada"}`.

---

## 📝 Changelog

### [En Desarrollo] - Enero 2026

- 🎉 Inicio del proyecto
- 📐 Definición de arquitectura y estructura
- 📝 Documentación de pseudocódigo para todos los módulos
- 🔧 Configuración inicial de TypeScript y dependencias

---

## 🤝 Contribución

Este proyecto está en desarrollo activo. Las contribuciones, issues y feature requests son bienvenidos.

---

## 📄 Licencia

MIT © 2026

---

<p align="center">
  <b>🔨 Proyecto en construcción activa desde Enero 2026</b>
</p>

---

# 🚀 Nexus Gateway (English)

> High-performance API Gateway with rate limiting, authentication, and reverse proxy.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 📋 Description

**Nexus Gateway** is a lightweight and extensible API Gateway built with Node.js and TypeScript. It acts as a single entry point for microservices, providing:

- 🔐 **JWT Authentication** - Token validation and access control
- ⚡ **Rate Limiting** - Traffic control with Token Bucket and Sliding Window algorithms
- 🔄 **Reverse Proxy** - Smart routing to backend services
- 📊 **Redis Integration** - Session and rate-limit counters storage
- 🛡️ **Error Handling** - Consistent responses and centralized logging

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────────────────────────────────┐     ┌──────────────┐
│   Client    │────▶│             NEXUS GATEWAY               │────▶│  Services    │
└─────────────┘     │  ┌─────┐ ┌──────┐ ┌───────┐ ┌───────┐  │     │  Backend     │
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

## 📁 Project Structure

```
nexus-gateway/
├── src/
│   ├── app.ts                    # Main entry point
│   ├── config/
│   │   ├── gateway.ts            # Routes and services configuration
│   │   └── redis.ts              # Redis connection configuration
│   ├── core/
│   │   ├── algorithms/
│   │   │   └── rate-limit.logic.ts   # Token Bucket & Sliding Window algorithms
│   │   └── interfaces/
│   │       └── request.interface.ts  # TypeScript types and interfaces
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # Authentication and authorization
│   │   ├── error.handler.ts          # Centralized error handling
│   │   └── rate-limit.middleware.ts  # Rate limiting middleware
│   ├── proxy/
│   │   └── reverse-proxy.ts          # Reverse proxy logic
│   └── services/
│       └── redis.service.ts          # Redis client (singleton)
├── tests/
│   ├── integration/
│   └── unit/
├── .env.example                # Environment variables example
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
└── README.md
```

---

## ✅ Quick Start

### 1) Configure environment variables

Create a [.env](.env) file using [.env.example](.env.example) as a base and set your secret:

```bash
cp .env.example .env
```

Minimal example:

```dotenv
JWT_SECRET=una_clave_super_secreta_123
```

### 2) Start the gateway with Docker

```bash
docker compose up --build
```

### 3) Generate a JWT token

```bash
node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({ sub:'user-1', email:'user@example.com', role:'admin', permissions:['*'] }, process.env.JWT_SECRET || 'una_clave_super_secreta_123', { expiresIn: '1h' }))"
```

### 4) Call a protected endpoint

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/users
```

Notes:

- Routes and targets are configured in [src/config/gateway.ts](src/config/gateway.ts).
- If you hit an undefined path, you will get `{"statusCode":404,"message":"Ruta no encontrada"}`.

---

## 🚧 Current Project Status

| Component | Status | Description |
|-----------|--------|-------------|
| Base structure | ✅ Complete | Folders and files created |
| Pseudocode | ✅ Complete | Logic documented in each file |
| `redis.service.ts` | ✅ Complete | Redis client implementation |
| `auth.middleware.ts` | ✅ Complete | Authentication middleware implementation |
| `rate-limit.middleware.ts` | ✅ Complete | Rate limiting middleware implementation |
| `reverse-proxy.ts` | ✅ Complete | Reverse proxy logic implementation |
| `error.handler.ts` | ✅ Complete | Error handler implementation |
| Docker setup | ✅ Complete | `Dockerfile` and `docker-compose.yml` configured |
| Unit tests | ⏳ Pending | To be implemented |
| Integration tests | ⏳ Pending | To be implemented |

---

## 🛠️ Technologies

- **Runtime:** Node.js 18+
- **Language:** TypeScript 5.x
- **Framework:** Express.js
- **Cache/Store:** Redis (ioredis)
- **Proxy:** http-proxy
- **Auth:** jsonwebtoken
- **Containers:** Docker & Docker Compose

---

## 📝 Changelog

### [In Development] - January 2026

- 🎉 Project start
- 📐 Architecture and structure definition
- 📝 Pseudocode documentation for all modules
- 🔧 Initial setup of TypeScript and dependencies

---

## 🤝 Contributing

This project is under active development. Contributions, issues, and feature requests are welcome.

---

## 📄 License

MIT © 2026

---

<p align="center">
  <b>🔨 Project under active construction since January 2026</b>
</p>
