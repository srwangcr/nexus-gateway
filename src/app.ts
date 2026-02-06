import express, { type Application } from 'express';
import cors from 'cors';

import gatewayConfig from './config/gateway.js';
import redisConfig from './config/redis.js';
import { getRedisService } from './services/redis.service.js';
import { optionalAuth } from './middlewares/auth.middleware.js';
import { rateLimitMiddleware } from './middlewares/rate-limit.middleware.js';
import { proxyMiddleware } from './proxy/reverse-proxy.js';
import { errorHandler, manejarExcepcionesNoCapturadas, manejarRechazoPromesas, notFoundHandler } from './middlewares/error.handler.js';

function inicializarApp(): Application {
	const app = express();

	app.use(express.json({ limit: '1mb' }));
	app.use(cors());
	app.use(optionalAuth);
	app.use(rateLimitMiddleware);
	app.use(proxyMiddleware);
	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}

async function iniciarServidor(): Promise<void> {
	try {
		manejarRechazoPromesas();
		manejarExcepcionesNoCapturadas();

		const redisService = getRedisService(redisConfig);
		await redisService.connect();

		const app = inicializarApp();
		app.listen(gatewayConfig.port, () => {
			console.log(`Nexus Gateway escuchando en puerto ${gatewayConfig.port}`);
		});
	} catch (error) {
		console.error('Error al iniciar el servidor:', error);
		process.exit(1);
	}
}

iniciarServidor();


