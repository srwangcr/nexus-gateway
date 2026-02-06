// ================================================
// MIDDLEWARE DE AUTENTICACION - auth.middleware.ts
// ================================================

// IMPORTAR: jwt, interfaces, configuracion

// FUNCION: extractToken(request): string | null
//   OBTENER: header Authorization
//   SI header existe y comienza con "Bearer ":
//     EXTRAER: token despues de "Bearer "
//     RETORNAR: token
//   SINO:
//     RETORNAR: null

// FUNCION: verifyToken(token: string): User | null
//   INTENTAR:
//     VERIFICAR: token con jwt.verify()
//     EXTRAER: payload del token
//     VALIDAR: estructura del payload
//     RETORNAR: objeto User del payload
//   CAPTURAR_ERROR:
//     REGISTRAR: error de verificacion
//     RETORNAR: null

// MIDDLEWARE: authMiddleware(req, res, next)
//   EXTRAER: token del request
//
//   SI no hay token:
//     RESPONDER: 401 Unauthorized
//     MENSAJE: "Token de autenticacion requerido"
//     TERMINAR
//
//   VERIFICAR: token
//
//   SI token invalido:
//     RESPONDER: 403 Forbidden
//     MENSAJE: "Token invalido o expirado"
//     TERMINAR
//
//   ASIGNAR: informacion del usuario a req.user
//   GENERAR: requestId unico
//   ASIGNAR: requestId a req.requestId
//   OBTENER: IP del cliente
//   ASIGNAR: IP a req.clientIp
//
//   LLAMAR: next()

// MIDDLEWARE: optionalAuth(req, res, next)
//   EXTRAER: token del request
//
//   SI hay token:
//     VERIFICAR: token
//     SI token valido:
//       ASIGNAR: usuario a req.user
//
//   LLAMAR: next()

// FUNCION: checkPermission(permission: string)
//   RETORNAR: middleware function(req, res, next)
//     SI no hay usuario autenticado:
//       RESPONDER: 401 Unauthorized
//       TERMINAR
//
//     SI usuario no tiene el permiso:
//       RESPONDER: 403 Forbidden
//       MENSAJE: "Permisos insuficientes"
//       TERMINAR
//
//     LLAMAR: next()

// EXPORTAR: authMiddleware, optionalAuth, checkPermission
