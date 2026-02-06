import type { NextFunction, Request, Response } from 'express';

import redisConfig from '../config/redis.js';
import { getRedisService } from '../services/redis.service.js';
import type { AuthenticatedRequest } from '../core/interfaces/request.interface.js';

interface RateLimitConfig {
	windowMs: number;
	maxRequests: number;
	message: string;
	skipSuccessfulRequests: boolean;
	skipFailedRequests: boolean;
	keyGenerator?: (req: Request) => string;
}

interface RateLimitState {
	count: number;
	windowStart: number;
}

function generarKey(req: Request): string {
	const request = req as AuthenticatedRequest;
	const clientIp = request.clientIp || req.ip || 'unknown';
	const route = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
	const userId = request.user?.id;

	if (userId) {
		return `ratelimit:user:${userId}:${route}`;
	}
	return `ratelimit:ip:${clientIp}:${route}`;
}

function parseState(raw: string | null): RateLimitState | null {
	if (!raw) {
		return null;
	}
	try {
		const parsed = JSON.parse(raw) as RateLimitState;
		if (typeof parsed.count === 'number' && typeof parsed.windowStart === 'number') {
			return parsed;
		}
		return null;
	} catch {
		return null;
	}
}

function formatResetTimestamp(windowStart: number, windowMs: number): number {
	return Math.ceil((windowStart + windowMs) / 1000);
}

function shouldSkipCount(statusCode: number, config: RateLimitConfig): boolean {
	if (config.skipSuccessfulRequests && statusCode < 400) {
		return true;
	}
	if (config.skipFailedRequests && statusCode >= 400) {
		return true;
	}
	return false;
}

function crearRateLimiter(config: RateLimitConfig) {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const key = config.keyGenerator ? config.keyGenerator(req) : generarKey(req);
			const redisService = getRedisService(redisConfig);

			const now = Date.now();
			const rawState = await redisService.get(key);
			const existingState = parseState(rawState);

			let state: RateLimitState;
			if (!existingState || now - existingState.windowStart >= config.windowMs) {
				state = { count: 0, windowStart: now };
				await redisService.set(key, JSON.stringify(state), Math.ceil(config.windowMs / 1000));
			} else {
				state = existingState;
			}

			const projectedCount = state.count + 1;
			if (projectedCount > config.maxRequests) {
				const reset = formatResetTimestamp(state.windowStart, config.windowMs);
				const retryAfter = Math.max(0, Math.ceil((state.windowStart + config.windowMs - now) / 1000));

				res.setHeader('X-RateLimit-Limit', String(config.maxRequests));
				res.setHeader('X-RateLimit-Remaining', '0');
				res.setHeader('X-RateLimit-Reset', String(reset));
				res.setHeader('Retry-After', String(retryAfter));
				res.status(429).json({ message: config.message });
				return;
			}

			state.count = projectedCount;
			await redisService.set(key, JSON.stringify(state), Math.ceil(config.windowMs / 1000));

			const remaining = Math.max(0, config.maxRequests - state.count);
			res.setHeader('X-RateLimit-Limit', String(config.maxRequests));
			res.setHeader('X-RateLimit-Remaining', String(remaining));
			res.setHeader('X-RateLimit-Reset', String(formatResetTimestamp(state.windowStart, config.windowMs)));

			res.on('finish', async () => {
				if (shouldSkipCount(res.statusCode, config)) {
					try {
						const currentState = parseState(await redisService.get(key));
						if (currentState) {
							currentState.count = Math.max(0, currentState.count - 1);
							await redisService.set(
								key,
								JSON.stringify(currentState),
								Math.ceil(config.windowMs / 1000),
							);
						}
					} catch (error) {
						console.warn('Failed to adjust rate limit counters:', error);
					}
				}
			});

			next();
		} catch (error) {
			console.error('Rate limiting error:', error);
			const failOpen = process.env.RATE_LIMIT_FAIL_OPEN !== 'false';
			if (failOpen) {
				next();
			} else {
				res.status(503).json({ message: 'Servicio no disponible' });
			}
		}
	};
}

const rateLimitMiddleware = crearRateLimiter({
	windowMs: 15 * 60 * 1000,
	maxRequests: 100,
	message: 'Demasiadas solicitudes, intenta mas tarde',
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
});

function rateLimitPorRuta(maxRequests: number, windowMs: number) {
	return crearRateLimiter({
		windowMs,
		maxRequests,
		message: 'Demasiadas solicitudes, intenta mas tarde',
		skipSuccessfulRequests: false,
		skipFailedRequests: false,
	});
}

function rateLimitEstricto() {
	return crearRateLimiter({
		windowMs: 60 * 1000,
		maxRequests: 10,
		message: 'Limite de rate estricto excedido',
		skipSuccessfulRequests: false,
		skipFailedRequests: false,
	});
}

export { rateLimitMiddleware, rateLimitPorRuta, rateLimitEstricto, crearRateLimiter };
