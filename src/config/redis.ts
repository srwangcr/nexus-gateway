// ======================================
// CONFIGURACIÓN DE REDIS - redis.ts
// ======================================

// INTERFAZ: RedisConfig
//   host: string - dirección del servidor Redis
//   port: number - puerto de Redis
//   password: string (opcional) - contraseña si es necesaria
//   db: number - número de base de datos
//   maxRetriesPerRequest: number - reintentos máximos
//   enableReadyCheck: boolean - verificar estado ready
//   retryStrategy: función para manejo de reconexión

// CONSTANTE: redisConfig
//   LEER: variables de entorno (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)
//   DEFINIR: host (default: 'localhost')
//   DEFINIR: port (default: 6379)
//   DEFINIR: password (opcional)
//   DEFINIR: db (default: 0)
//   DEFINIR: maxRetriesPerRequest (default: 3)
//   DEFINIR: enableReadyCheck (true)
//   DEFINIR: retryStrategy - función que maneja reconexión exponencial

// EXPORTAR: redisConfig
