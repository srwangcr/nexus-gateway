// ======================================================
// MIDDLEWARE DE RATE LIMITING - rate-limit.middleware.ts
// ======================================================

// IMPORTAR: RedisService, algoritmos, interfaces

// INTERFAZ: RateLimitConfig
//   windowMs: number - ventana de tiempo en milisegundos
//   maxRequests: number - maximo de requests por ventana
//   message: string - mensaje cuando se excede el limite
//   skipSuccessfulRequests: boolean - no contar requests exitosos
//   skipFailedRequests: boolean - no contar requests fallidos
//   keyGenerator: funcion para generar key unica por cliente

// FUNCION: generarKey(req): string
//   OBTENER: clientIp del request
//   OBTENER: userId si esta autenticado
//   OBTENER: ruta del request
//
//   SI hay usuario autenticado:
//     RETORNAR: "ratelimit:user:{userId}:{ruta}"
//   SINO:
//     RETORNAR: "ratelimit:ip:{clientIp}:{ruta}"

// FUNCION: crearRateLimiter(config: RateLimitConfig)
//   RETORNAR: middleware async(req, res, next)
//     INTENTAR:
//       GENERAR: key unica para el cliente
//       OBTENER: RedisService instance
//
//       OBTENER: datos actuales del Redis
//         - contador de requests
//         - timestamp de ventana
//
//       CALCULAR: timestamp actual
//
//       SI no hay datos o ventana expiro:
//         CREAR: nueva ventana
//         ESTABLECER: contador = 1
//         ESTABLECER: expiration = windowMs
//         PERMITIR: request
//       SINO:
//         SI contador < maxRequests:
//           INCREMENTAR: contador en Redis
//           PERMITIR: request
//         SINO:
//           CALCULAR: tiempo restante hasta reset
//           AGREGAR: headers de respuesta
//             - X-RateLimit-Limit
//             - X-RateLimit-Remaining (0)
//             - X-RateLimit-Reset
//             - Retry-After
//           RESPONDER: 429 Too Many Requests
//           MENSAJE: del config
//           TERMINAR
//
//       AGREGAR: headers informativos
//         - X-RateLimit-Limit
//         - X-RateLimit-Remaining
//         - X-RateLimit-Reset
//
//       LLAMAR: next()
//
//     CAPTURAR_ERROR:
//       REGISTRAR: error en rate limiting
//       DECIDIR: permitir o bloquear (fail open vs fail closed)
//       SI fail open:
//         LLAMAR: next()
//       SINO:
//         RESPONDER: 503 Service Unavailable

// MIDDLEWARE: rateLimitMiddleware
//   CONFIGURACION_DEFAULT:
//     windowMs: 15 * 60 * 1000 (15 minutos)
//     maxRequests: 100
//     message: "Demasiadas solicitudes, intenta mas tarde"
//     skipSuccessfulRequests: false
//     skipFailedRequests: false
//
//   RETORNAR: crearRateLimiter(CONFIGURACION_DEFAULT)

// FUNCION: rateLimitPorRuta(maxRequests: number, windowMs: number)
//   CREAR: configuracion personalizada
//   RETORNAR: crearRateLimiter(config)

// FUNCION: rateLimitEstricto()
//   CONFIGURACION:
//     windowMs: 60 * 1000 (1 minuto)
//     maxRequests: 10
//     message: "Limite de rate estricto excedido"
//   RETORNAR: crearRateLimiter(config)

// EXPORTAR: rateLimitMiddleware, rateLimitPorRuta, rateLimitEstricto
