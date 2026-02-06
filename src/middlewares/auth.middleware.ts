import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import type { AuthenticatedRequest, User } from '../core/interfaces/request.interface.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

function extractToken(request: Request): string | null {
	const authHeader = request.headers.authorization;
	if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
		return authHeader.slice('Bearer '.length).trim();
	}
	return null;
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

function verifyToken(token: string): User | null {
	try {
		const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
		return buildUserFromPayload(payload);
	} catch (error) {
		console.warn('Token verification failed:', error);
		return null;
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
		res.status(401).json({ message: 'Token de autenticacion requerido' });
		return;
	}

	const user = verifyToken(token);
	if (!user) {
		res.status(403).json({ message: 'Token invalido o expirado' });
		return;
	}

	const authenticatedRequest = req as AuthenticatedRequest;
	authenticatedRequest.user = user;
	ensureRequestContext(authenticatedRequest);
	next();
}

function optionalAuth(req: Request, res: Response, next: NextFunction): void {
	const token = extractToken(req);
	const authenticatedRequest = req as AuthenticatedRequest;

	if (token) {
		const user = verifyToken(token);
		if (user) {
			authenticatedRequest.user = user;
		}
	}

	ensureRequestContext(authenticatedRequest);
	next();
}

function checkPermission(permission: string) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const authenticatedRequest = req as AuthenticatedRequest;
		if (!authenticatedRequest.user) {
			res.status(401).json({ message: 'Token de autenticacion requerido' });
			return;
		}

		const { permissions } = authenticatedRequest.user;
		if (!permissions.includes(permission)) {
			res.status(403).json({ message: 'Permisos insuficientes' });
			return;
		}

		next();
	};
}

export { authMiddleware, optionalAuth, checkPermission, extractToken, verifyToken };
