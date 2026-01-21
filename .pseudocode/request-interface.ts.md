// ===============================================
// INTERFACES DE REQUEST - request.interface.ts
// ===============================================

// INTERFAZ: User
//   id: string - identificador único del usuario
//   email: string - correo electrónico
//   role: string - rol del usuario (admin, user, etc.)
//   permissions: array de strings - permisos específicos

// INTERFAZ: AuthenticatedRequest extends Request
//   user?: User - información del usuario autenticado
//   clientIp: string - dirección IP del cliente
//   requestId: string - ID único para rastreo del request
// INTERFAZ: RateLimitInfo
//   limit: number - límite máximo de requests
//   remaining: number - requests restantes
//   reset: number - timestamp de reset
//   retryAfter?: number - segundos hasta poder reintentar
// INTERFAZ: ProxyOptions
//   target: string - URL del servicio destino
//   timeout: number - timeout en milisegundos
//   retries: number - número de reintentos
//   headers: objeto con headers adicionales

// EXPORTAR: todas las interfaces