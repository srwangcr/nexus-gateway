import type { NextFunction, Request, Response } from 'express';

import type { AuthenticatedRequest } from '../core/interfaces/request.interface.js';

class AppError extends Error {
	public statusCode: number;
	public isOperational: boolean;
	public details?: unknown;

	constructor(message: string, statusCode: number, isOperational = true, details?: unknown) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.details = details;
		Error.captureStackTrace(this, this.constructor);
	}
}

function determinarCodigoEstado(error: unknown): number {
	if (error instanceof AppError && typeof error.statusCode === 'number') {
		return error.statusCode;
	}

	if (typeof error === 'object' && error !== null) {
		const name = String((error as { name?: string }).name ?? '').toLowerCase();
		const code = String((error as { code?: string }).code ?? '').toLowerCase();

		if (name.includes('validation') || name.includes('syntax')) {
			return 400;
		}
		if (name.includes('auth') || name.includes('unauthorized')) {
			return 401;
		}
		if (name.includes('forbidden') || name.includes('permission')) {
			return 403;
		}
		if (name.includes('notfound') || name.includes('not found')) {
			return 404;
		}
		if (name.includes('timeout') || code === 'etimedout') {
			return 504;
		}
	}

	return 500;
}

function esErrorOperacional(error: unknown): boolean {
	if (typeof error === 'object' && error !== null && 'isOperational' in error) {
		return Boolean((error as { isOperational?: boolean }).isOperational);
	}
	return false;
}

function registrarError(error: unknown, req: Request): void {
	const request = req as AuthenticatedRequest;
	const logPayload = {
		timestamp: new Date().toISOString(),
		requestId: request.requestId,
		method: req.method,
		path: req.originalUrl,
		user: request.user?.id,
		message: error instanceof Error ? error.message : 'Unknown error',
		stack: error instanceof Error ? error.stack : undefined,
		headers: {
			'user-agent': req.headers['user-agent'],
			'x-forwarded-for': req.headers['x-forwarded-for'],
		},
	};

	if (esErrorOperacional(error)) {
		console.warn('Operational error:', logPayload);
	} else {
		console.error('Unhandled error:', logPayload);
	}
}

function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
	registrarError(error, req);

	const statusCode = determinarCodigoEstado(error);
	const operational = esErrorOperacional(error);
	const isDev = (process.env.NODE_ENV ?? 'development') !== 'production';

	const responseBody: Record<string, unknown> = {
		statusCode,
		message: operational || isDev
			? (error instanceof Error ? error.message : 'Error')
			: 'Internal server error',
	};

	if (isDev) {
		(responseBody as any).stack = error instanceof Error ? error.stack : undefined;
		(responseBody as any).details = (error as { details?: unknown })?.details;
	}

	const requestId = (req as AuthenticatedRequest).requestId;
	if (requestId) {
		res.setHeader('X-Request-Id', requestId);
	}
	res.setHeader('X-Error-Code', String(statusCode));
	res.status(statusCode).json(responseBody);
}

function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
	next(new AppError('Route not found', 404, true));
}

function manejarRechazoPromesas(): void {
	process.on('unhandledRejection', (reason) => {
		console.error('Unhandled rejection:', reason);
		setImmediate(() => {
			throw reason;
		});
	});
}

function manejarExcepcionesNoCapturadas(): void {
	process.on('uncaughtException', (error) => {
		console.error('Uncaught exception:', error);
		process.exit(1);
	});
}

export {
	AppError,
	errorHandler,
	notFoundHandler,
	determinarCodigoEstado,
	esErrorOperacional,
	registrarError,
	manejarRechazoPromesas,
	manejarExcepcionesNoCapturadas,
};
