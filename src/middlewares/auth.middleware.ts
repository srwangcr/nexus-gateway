import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';

import redisConfig from '../config/redis.js';
import type { AuthenticatedRequest, User } from '../core/interfaces/request.interface.js';
import { getRedisService } from '../services/redis.service.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'una_clave_super_secreta_123';
const JWT_VALIDATION_CACHE_TTL_SECONDS = 5 * 60;
const { JsonWebTokenError, TokenExpiredError } = jwt;

interface CachedTokenValidation {
    user: User;
}

function extractToken(request: Request): string | null {
    const authHeader = request.header('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
}

function buildUserFromPayload(payload: JwtPayload): User | null {
    const id = String(payload.sub ?? payload.id ?? '').trim();
    const email = String(payload.email ?? '').trim();
    const role = String(payload.role ?? '').trim();
    const permissions = Array.isArray(payload.permissions) ? payload.permissions : [];

    if (!id || !email || !role) {
        return null;
    }

    return {
        id,
        email,
        role,
        permissions,
    };
}

function verifyToken(token: string): User {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = buildUserFromPayload(payload);

        if (!user) {
            throw new Error('Invalid token payload');
        }

        return user;
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            throw new Error('Authentication token has expired');
        }

        if (error instanceof JsonWebTokenError) {
            throw new Error('Invalid authentication token');
        }

        throw new Error('Invalid authentication token');
    }
}

function buildTokenCacheKey(token: string): string {
    const hash = createHash('md5').update(token).digest('hex');
    return `token:${hash}`;
}

async function getCachedTokenUser(token: string): Promise<User | null> {
    const redisService = getRedisService(redisConfig);
    const cacheKey = buildTokenCacheKey(token);

    if (!(await redisService.exists(cacheKey))) {
        return null;
    }

    const cachedValue = await redisService.get(cacheKey);
    if (!cachedValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(cachedValue) as CachedTokenValidation;
        return parsed.user ?? null;
    } catch {
        await redisService.delete(cacheKey).catch(() => undefined);
        return null;
    }
}

async function verifyTokenWithCache(token: string): Promise<User> {
    try {
        const cachedUser = await getCachedTokenUser(token);
        if (cachedUser) {
            return cachedUser;
        }
    } catch (error) {
        console.warn('JWT cache lookup failed:', error);
    }

    const user = verifyToken(token);
    const redisService = getRedisService(redisConfig);
    const cacheKey = buildTokenCacheKey(token);

    try {
        await redisService.set(
            cacheKey,
            JSON.stringify({ user } satisfies CachedTokenValidation),
            JWT_VALIDATION_CACHE_TTL_SECONDS,
        );
    } catch (error) {
        console.warn('JWT cache write failed:', error);
    }

    return user;
}

function getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded.trim() !== '') {
        return forwarded.split(',')[0].trim();
    }

    return request.ip || request.socket?.remoteAddress || 'unknown';
}

function ensureRequestContext(request: AuthenticatedRequest): void {
    if (!request.requestId) {
        request.requestId = uuidv4();
    }

    if (!request.clientIp) {
        request.clientIp = getClientIp(request);
    }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = extractToken(req);

    if (!token) {
        res.status(401).json({ message: 'Authentication token is required' });
        return;
    }

    try {
        const user = await verifyTokenWithCache(token);
        const authenticatedRequest = req as AuthenticatedRequest;

        authenticatedRequest.user = user;
        ensureRequestContext(authenticatedRequest);
        next();
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Invalid authentication token';

        res.status(403).json({ message });
    }
}

async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const token = extractToken(req);
    const authenticatedRequest = req as AuthenticatedRequest;

    if (token) {
        try {
            authenticatedRequest.user = await verifyTokenWithCache(token);
        } catch {
            // Optional auth: ignore invalid tokens and continue unauthenticated.
        }
    }

    ensureRequestContext(authenticatedRequest);
    next();
}

function checkPermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authenticatedRequest = req as AuthenticatedRequest;

        if (!authenticatedRequest.user) {
            res.status(401).json({ message: 'Authentication token is required' });
            return;
        }

        const { permissions } = authenticatedRequest.user;

        if (!permissions.includes(permission)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }

        next();
    };
}

export { authMiddleware, optionalAuth, checkPermission, extractToken, verifyToken };
