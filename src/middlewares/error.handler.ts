// ================================================
// MIDDLEWARE DE MANEJO DE ERRORES - error.handler.ts
// ================================================

// CLASE: AppError extends Error
//   PROPIEDADES:
//     statusCode: number - código HTTP del error
//     isOperational: boolean - si es error operacional o programático
//     details?: any - detalles adicionales del error
//   
//   CONSTRUCTOR(message, statusCode, isOperational = true, details?):
//     LLAMAR: super(message)
//     ASIGNAR: propiedades
//     CAPTURAR: stack trace

// FUNCIÓN: determinarCodigoEstado(error): number
//   SI error tiene statusCode:
//     RETORNAR: error.statusCode
//   SI error es de validación:
//     RETORNAR: 400
//   SI error es de autenticación:
//     RETORNAR: 401
//   SI error es de autorización:
//     RETORNAR: 403
//   SI error es de recurso no encontrado:
//     RETORNAR: 404
//   SI error es de timeout:
//     RETORNAR: 504
//   POR_DEFECTO:
//     RETORNAR: 500

// FUNCIÓN: esErrorOperacional(error): boolean
//   SI error tiene propiedad isOperational:
//     RETORNAR: error.isOperational
//   SINO:
//     RETORNAR: false

// FUNCIÓN: registrarError(error, req)
//   CREAR: objeto de log con:
//     - timestamp
//     - requestId (si existe)
//     - método HTTP
//     - ruta
//     - usuario (si está autenticado)
//     - mensaje de error
//     - stack trace
//     - headers relevantes
//   
//   SI es error operacional:
//     REGISTRAR: como WARNING
//   SINO:
//     REGISTRAR: como ERROR

// MIDDLEWARE: errorHandler(error, req, res, next)
//   REGISTRAR: error con contexto
//   
//   DETERMINAR: código de estado
//   
//   CREAR: respuesta de error
//     SI entorno es desarrollo:
//       INCLUIR: stack trace y detalles completos
//     SI entorno es producción:
//       SI es error operacional:
//         INCLUIR: mensaje del error
//       SINO:
//         INCLUIR: mensaje genérico "Error interno del servidor"
//   
//   AGREGAR: headers de respuesta
//     - X-Request-Id
//     - X-Error-Code
//   
//   ENVIAR: respuesta JSON con código de estado
//   
//   SI no es error operacional:
//     CONSIDERAR: reiniciar el proceso o alertar

// MIDDLEWARE: notFoundHandler(req, res, next)
//   CREAR: AppError con mensaje "Ruta no encontrada"
//   CÓDIGO: 404
//   LLAMAR: next(error)

// FUNCIÓN: manejarRechazoPromesas()
//   ESCUCHAR: evento 'unhandledRejection'
//     REGISTRAR: error
//     LANZAR: error para que sea capturado por errorHandler

// FUNCIÓN: manejarExcepcionesNoCapturadas()
//   ESCUCHAR: evento 'uncaughtException'
//     REGISTRAR: error crítico
//     SALIR: del proceso con código 1

// EXPORTAR: AppError, errorHandler, notFoundHandler, funciones de manejo
