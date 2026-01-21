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
| `auth.middleware.ts` | ⏳ Pendiente | Por implementar |
| `rate-limit.middleware.ts` | ⏳ Pendiente | Por implementar |
| `reverse-proxy.ts` | ⏳ Pendiente | Por implementar |
| `error.handler.ts` | ⏳ Pendiente | Por implementar |
| Tests unitarios | ⏳ Pendiente | Por implementar |
| Tests de integración | ⏳ Pendiente | Por implementar |
| Docker setup | ⏳ Pendiente | Por configurar |

---

## 🛠️ Tecnologías

- **Runtime:** Node.js 18+
- **Lenguaje:** TypeScript 5.x
- **Framework:** Express.js
- **Cache/Store:** Redis (ioredis)
- **Proxy:** http-proxy-middleware
- **Auth:** jsonwebtoken
- **Contenedores:** Docker & Docker Compose

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
