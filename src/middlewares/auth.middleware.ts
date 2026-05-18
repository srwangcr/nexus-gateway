import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import type { AuthenticatedRequest, User } from '../core/interfaces/request.interface.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'una_clave_super_secreta_123';
const { JsonWebTokenError, TokenExpiredError } = jwt;

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

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const token = extractToken(req);

    if (!token) {
        res.status(401).json({ message: 'Authentication token is required' });
        return;
    }

    try {
        const user = verifyToken(token);
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

function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const token = extractToken(req);
    const authenticatedRequest = req as AuthenticatedRequest;

    if (token) {
        try {
            authenticatedRequest.user = verifyToken(token);
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
