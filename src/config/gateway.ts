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


interface RouteConfig { // create a interface routing configuration
    
    path: String; // Endpoint path
    target: String; // Endpount target URL
    methods : String[]; // Allowed HTTP methods
    requiresAuth: Boolean;
    rateLimit: {
        windowMs: Number; // Time window in milliseconds
        maxRequests: Number; // Max requests per window
    };
}

interface GatewayConfig {
    port: number;
    routes: RouteConfig[];
    timeout:number;
    retries: number;
}

const gatewayConfig: GatewayConfig = {
    port: Number(process.env.GATEWAY_PORT) ?? 3000,
    timeout: Number(process.env.GATEWAY_TIMEOUT) ?? 30000,
    retries: Number(process.env.GATEWAY_RETRIES) ?? 3,
    routes: [
        {
            path: '/api/users',
            target: 'http://users-service:3001',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            requiresAuth: true,
            rateLimit: {
                windowMs: 60000,
                maxRequests: 100,
            },
        },
        {
            path: '/api/products',
            target: 'http://products-service:3002',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            requiresAuth: true,
            rateLimit: {
                windowMs: 60000,
                maxRequests: 100,
            },
        },
        {
            path: '/api/orders',
            target: 'http://orders-service:3003',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            requiresAuth: true,
            rateLimit: {
                windowMs: 60000,
                maxRequests: 100,
            },
        },
    ],
};

export default gatewayConfig;
