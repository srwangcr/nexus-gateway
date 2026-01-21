// =========================================
// CONFIGURACIÓN DEL GATEWAY - gateway.ts
// =========================================

// INTERFAZ: RouteConfig
//   path: string - ruta del endpoint
//   target: string - URL del servicio destino
//   methods: array de strings - métodos HTTP permitidos
//   requiresAuth: boolean - si requiere autenticación
//   rateLimit: objeto con configuración de límite

// INTERFAZ: GatewayConfig
//   port: number - puerto del gateway
//   routes: array de RouteConfig
//   timeout: number - timeout de requests
//   retries: number - reintentos en caso de fallo

// CONSTANTE: gatewayConfig
//   LEER: variables de entorno
//   DEFINIR: puerto (default: 3000)
//   DEFINIR: timeout (default: 30000)
//   DEFINIR: retries (default: 3)
//   DEFINIR: array de rutas con sus configuraciones
//     EJEMPLO: /api/users -> http://users-service:3001
//     EJEMPLO: /api/products -> http://products-service:3002
//     EJEMPLO: /api/orders -> http://orders-service:3003

// EXPORTAR: gatewayConfig