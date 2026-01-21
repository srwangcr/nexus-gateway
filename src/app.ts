// ===================================
// PUNTO DE ENTRADA PRINCIPAL - app.ts
// ===================================

// IMPORTAR: express, middlewares, configuraciones, servicios

// FUNCIÓN: inicializarApp()
//   CREAR: instancia de Express
//   CONFIGURAR: middleware de JSON
//   CONFIGURAR: middleware de CORS
//   CONFIGURAR: middleware de autenticación
//   CONFIGURAR: middleware de rate limiting
//   CONFIGURAR: reverse proxy handler
//   CONFIGURAR: error handler (debe ser el último)
//   RETORNAR: instancia de app

// FUNCIÓN: iniciarServidor()
//   INTENTAR:
//     CONECTAR: a Redis
//     INICIALIZAR: aplicación
//     INICIAR: servidor en puerto configurado
//     MOSTRAR: mensaje de éxito
//   CAPTURAR_ERROR:
//     MOSTRAR: error y salir del proceso

// EJECUTAR: iniciarServidor()
