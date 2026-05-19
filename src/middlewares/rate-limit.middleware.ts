import type { NextFunction, Request, Response } from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import redisConfig from '../config/redis.js';
import { getRedisService } from '../services/redis.service.js';
import type { AuthenticatedRequest } from '../core/interfaces/request.interface.js';

interface RateLimitConfig {
	windowMs: number;
	limit: number;
	message: string;
	keyGenerator?: (req: Request) => string;
}

function generarKey(req: Request): string {
	const request = req as AuthenticatedRequest;
	const clientIp = request.clientIp || req.ip || 'unknown';
	const userId = request.user?.id;

	if (userId) {
		return `ratelimit:user:${userId}`;
	}
	return `ratelimit:ip:${ipKeyGenerator(clientIp)}`;
}

function crearRateLimiter(config: RateLimitConfig) {
	const redisService = getRedisService(redisConfig);
	const store = new RedisStore({
		sendCommand: async (command: string, ...args: (string | number | Buffer)[]) => {
			return redisService.getClient().call(command, ...args) as Promise<any>;
		},
		prefix: 'gateway:rate-limit:',
		resetExpiryOnChange: true,
	});

	return rateLimit({
		windowMs: config.windowMs,
		limit: config.limit,
		standardHeaders: 'draft-8',
		legacyHeaders: false,
		passOnStoreError: process.env.RATE_LIMIT_FAIL_OPEN !== 'false',
		store,
		keyGenerator: config.keyGenerator ?? generarKey,
		handler: (_req, res, _next, options) => {
			res.status(options.statusCode).json({ message: config.message });
		},
	});
}

const rateLimitMiddleware = crearRateLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	message: 'Too many requests, try again later',
});

function rateLimitPorRuta(maxRequests: number, windowMs: number) {
	return crearRateLimiter({
		windowMs,
		limit: maxRequests,
		message: 'Too many requests, try again later',
	});
}

function rateLimitEstricto() {
	return crearRateLimiter({
		windowMs: 60 * 1000,
		limit: 10,
		message: 'Strict rate limit exceeded',
	});
}

export { rateLimitMiddleware, rateLimitPorRuta, rateLimitEstricto, crearRateLimiter };
