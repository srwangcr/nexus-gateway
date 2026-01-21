// =================================================
// ALGORITMOS DE RATE LIMITING - rate-limit.logic.ts
// =================================================

// CLASE: TokenBucket
//   PROPIEDADES:
//     capacity: number - capacidad máxima del bucket
//     tokens: number - tokens disponibles actualmente
//     refillRate: number - tasa de recarga (tokens/segundo)
//     lastRefill: number - timestamp de última recarga
//   
//   CONSTRUCTOR(capacity, refillRate):
//     INICIALIZAR: propiedades con valores dados
//   
//   MÉTODO: refill()
//     CALCULAR: tiempo transcurrido desde última recarga
//     CALCULAR: tokens a agregar basado en tiempo y tasa
//     ACTUALIZAR: cantidad de tokens (sin exceder capacidad)
//     ACTUALIZAR: lastRefill a tiempo actual
//   
//   MÉTODO: consume(tokens = 1): boolean
//     EJECUTAR: refill()
//     SI tokens disponibles >= tokens solicitados:
//       RESTAR: tokens del bucket
//       RETORNAR: true
//     SINO:
//       RETORNAR: false

// CLASE: SlidingWindow
//   PROPIEDADES:
//     limit: number - límite de requests
//     window: number - ventana de tiempo (segundos)
//     requests: Map - mapa de timestamps por cliente
//   
//   CONSTRUCTOR(limit, window):
//     INICIALIZAR: propiedades
//   
//   MÉTODO: isAllowed(clientId: string): boolean
//     OBTENER: lista de timestamps del cliente
//     FILTRAR: timestamps dentro de la ventana actual
//     SI cantidad < límite:
//       AGREGAR: timestamp actual
//       RETORNAR: true
//     SINO:
//       RETORNAR: false
//   
//   MÉTODO: getRemainingTime(clientId: string): number
//     OBTENER: timestamp más antiguo del cliente
//     CALCULAR: tiempo hasta que expire
//     RETORNAR: tiempo en segundos

// FUNCIÓN: calcularBackoffExponencial(intento: number): number
//   CALCULAR: tiempo de espera = baseTime * (2 ^ intento)
//   APLICAR: jitter aleatorio para evitar thundering herd
//   RETORNAR: tiempo de espera en milisegundos

// EXPORTAR: clases y funciones
