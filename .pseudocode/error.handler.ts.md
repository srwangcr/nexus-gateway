// ================================================
// MIDDLEWARE DE MANEJO DE ERRORES - error.handler.ts
// ================================================

// CLASE: AppError extends Error
//   PROPIEDADES:
//     statusCode: number - codigo HTTP del error
//     isOperational: boolean - si es error operacional o programatico
//     details?: any - detalles adicionales del error
//
//   CONSTRUCTOR(message, statusCode, isOperational = true, details?):
//     LLAMAR: super(message)
//     ASIGNAR: propiedades
//     CAPTURAR: stack trace

// FUNCION: determinarCodigoEstado(error): number
//   SI error tiene statusCode:
//     RETORNAR: error.statusCode
//   SI error es de validacion:
//     RETORNAR: 400
//   SI error es de autenticacion:
//     RETORNAR: 401
//   SI error es de autorizacion:
//     RETORNAR: 403
//   SI error es de recurso no encontrado:
//     RETORNAR: 404
//   SI error es de timeout:
//     RETORNAR: 504
//   POR_DEFECTO:
//     RETORNAR: 500

// FUNCION: esErrorOperacional(error): boolean
//   SI error tiene propiedad isOperational:
//     RETORNAR: error.isOperational
//   SINO:
//     RETORNAR: false

// FUNCION: registrarError(error, req)
//   CREAR: objeto de log con:
//     - timestamp
//     - requestId (si existe)
//     - metodo HTTP
//     - ruta
//     - usuario (si esta autenticado)
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
//   DETERMINAR: codigo de estado
//
//   CREAR: respuesta de error
//     SI entorno es desarrollo:
//       INCLUIR: stack trace y detalles completos
//     SI entorno es produccion:
//       SI es error operacional:
//         INCLUIR: mensaje del error
//       SINO:
//         INCLUIR: mensaje generico "Error interno del servidor"
//
//   AGREGAR: headers de respuesta
//     - X-Request-Id
//     - X-Error-Code
//
//   ENVIAR: respuesta JSON con codigo de estado
//
//   SI no es error operacional:
//     CONSIDERAR: reiniciar el proceso o alertar

// MIDDLEWARE: notFoundHandler(req, res, next)
//   CREAR: AppError con mensaje "Ruta no encontrada"
//   CODIGO: 404
//   LLAMAR: next(error)

// FUNCION: manejarRechazoPromesas()
//   ESCUCHAR: evento 'unhandledRejection'
//     REGISTRAR: error
//     LANZAR: error para que sea capturado por errorHandler

// FUNCION: manejarExcepcionesNoCapturadas()
//   ESCUCHAR: evento 'uncaughtException'
//     REGISTRAR: error critico
//     SALIR: del proceso con codigo 1

// EXPORTAR: AppError, errorHandler, notFoundHandler, funciones de manejo
