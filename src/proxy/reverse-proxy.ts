// ===========================================
// REVERSE PROXY - reverse-proxy.ts
// ===========================================

// IMPORTAR: http-proxy, gateway config, interfaces

// CLASE: ReverseProxy
//   PROPIEDADES:
//     proxy: instancia de http-proxy
//     config: configuración del gateway
//     routeMap: Map de rutas a configuraciones
//   
//   CONSTRUCTOR(config):
//     CREAR: instancia de http-proxy
//     CONFIGURAR: opciones del proxy
//       - changeOrigin: true
//       - proxyTimeout: desde config
//       - timeout: desde config
//     INICIALIZAR: routeMap desde config
//   
//   MÉTODO: encontrarRuta(path: string): RouteConfig | null
//     PARA cada ruta en routeMap:
//       SI path coincide con patrón de ruta:
//         RETORNAR: configuración de la ruta
//     RETORNAR: null
//   
//   MÉTODO: validarMetodo(metodo: string, rutaConfig): boolean
//     SI rutaConfig permite todos los métodos:
//       RETORNAR: true
//     SI método está en lista de métodos permitidos:
//       RETORNAR: true
//     RETORNAR: false
//   
//   MÉTODO: construirTargetUrl(rutaConfig, req): string
//     OBTENER: target base de rutaConfig
//     OBTENER: path restante después del prefix
//     CONSTRUIR: URL completa
//     AGREGAR: query params si existen
//     RETORNAR: URL completa
//   
//   MÉTODO: agregarHeadersProxy(req, headers)
//     AGREGAR: X-Forwarded-For
//     AGREGAR: X-Forwarded-Proto
//     AGREGAR: X-Forwarded-Host
//     AGREGAR: X-Request-Id
//     SI hay usuario autenticado:
//       AGREGAR: X-User-Id
//       AGREGAR: X-User-Role
//     RETORNAR: headers modificados
//   
//   MÉTODO: manejarErrorProxy(error, req, res)
//     REGISTRAR: error del proxy
//     
//     SI error es ECONNREFUSED:
//       RESPONDER: 503 Service Unavailable
//       MENSAJE: "Servicio no disponible"
//     SI error es ETIMEDOUT:
//       RESPONDER: 504 Gateway Timeout
//       MENSAJE: "Timeout al conectar con el servicio"
//     SI error es ECONNRESET:
//       RESPONDER: 502 Bad Gateway
//       MENSAJE: "Conexión interrumpida con el servicio"
//     POR_DEFECTO:
//       RESPONDER: 500 Internal Server Error
//       MENSAJE: "Error en el proxy"
//   
//   MÉTODO: manejarRespuestaProxy(proxyRes, req, res)
//     AGREGAR: headers de respuesta
//       - X-Proxied-By: "Nexus Gateway"
//       - X-Response-Time
//     
//     REGISTRAR: información del request proxied
//       - método, ruta, target
//       - código de respuesta
//       - tiempo de respuesta

// MIDDLEWARE: proxyMiddleware(req, res, next)
//   CREAR: instancia de ReverseProxy
//   
//   ENCONTRAR: configuración de ruta para el request
//   
//   SI no se encuentra ruta:
//     LLAMAR: next() // dejará que notFoundHandler lo maneje
//     TERMINAR
//   
//   VALIDAR: método HTTP
//   SI método no permitido:
//     RESPONDER: 405 Method Not Allowed
//     AGREGAR: header Allow con métodos permitidos
//     TERMINAR
//   
//   CONSTRUIR: URL de destino
//   
//   AGREGAR: headers del proxy
//   
//   CONFIGURAR: opciones del proxy
//     - target: URL de destino
//     - headers: headers modificados
//     - timeout: desde configuración
//   
//   REGISTRAR: inicio del proxy
//   GUARDAR: timestamp de inicio
//   
//   INTENTAR:
//     PROXEAR: request con reintentos
//     PARA intento de 1 a maxRetries:
//       INTENTAR:
//         PROXEAR: request
//         SI exitoso:
//           SALIR del loop
//       CAPTURAR_ERROR:
//         SI es último intento:
//           LANZAR: error
//         SINO:
//           ESPERAR: backoff exponencial
//           CONTINUAR: con siguiente intento
//   
//   CAPTURAR_ERROR:
//     MANEJAR: error del proxy

// FUNCIÓN: crearProxyRouter(gatewayConfig)
//   CREAR: router de Express
//   APLICAR: proxyMiddleware a todas las rutas
//   RETORNAR: router

// EXPORTAR: ReverseProxy, proxyMiddleware, crearProxyRouter
