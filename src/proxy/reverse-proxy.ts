import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import httpProxy from 'http-proxy';
import type { IncomingMessage } from 'http';

import gatewayConfig, { type GatewayConfig, type RouteConfig } from '../config/gateway.js';
import type { AuthenticatedRequest } from '../core/interfaces/request.interface.js';
import { calculateExponentialBackoff } from '../core/algorithms/rate-limit.logic.js';

const RESPONSE_TIME_KEY = Symbol('proxyStartTime');

class ReverseProxy {
	public proxy: httpProxy;
	public config: GatewayConfig;
	public routeMap: Map<string, RouteConfig>;

	constructor(config: GatewayConfig) {
		this.config = config;
		this.proxy = httpProxy.createProxyServer({
			changeOrigin: true,
			proxyTimeout: config.timeout,
			timeout: config.timeout,
		});
		this.routeMap = new Map(config.routes.map((route) => [route.path, route]));

		this.proxy.on('error', (error, req, res) => {
			this.manejarErrorProxy(error, req as Request, res as Response);
		});

		this.proxy.on('proxyRes', (proxyRes, req, res) => {
			this.manejarRespuestaProxy(proxyRes, req as Request, res as Response);
		});
	}

	public encontrarRuta(path: string): RouteConfig | null {
		for (const [routePath, routeConfig] of Array.from(this.routeMap.entries())) {
			if (routePath.includes('*')) {
				const pattern = new RegExp(`^${routePath.replace(/\*/g, '.*')}`);
				if (pattern.test(path)) {
					return routeConfig;
				}
			}
			if (path.startsWith(routePath)) {
				return routeConfig;
			}
		}
		return null;
	}

	public validarMetodo(metodo: string, rutaConfig: RouteConfig): boolean {
		const normalized = metodo.toUpperCase();
		if (rutaConfig.methods.some((method) => method === '*')) {
			return true;
		}
		return rutaConfig.methods.map((method) => method.toUpperCase()).includes(normalized);
	}

	public construirTargetUrl(rutaConfig: RouteConfig, req: Request): string {
		const baseTarget = new URL(rutaConfig.target);
		const requestPath = req.originalUrl || req.url;
		const [pathPart, queryPart] = requestPath.split('?');
		const remainingPath = pathPart.replace(rutaConfig.path, '') || '/';

		baseTarget.pathname = `${baseTarget.pathname.replace(/\/$/, '')}${remainingPath.startsWith('/') ? '' : '/'}${remainingPath}`;
		if (queryPart) {
			baseTarget.search = queryPart;
		}
		return baseTarget.toString();
	}

	public agregarHeadersProxy(req: Request, headers: Record<string, string>): Record<string, string> {
		const request = req as AuthenticatedRequest;
		const forwardedFor = req.headers['x-forwarded-for'];
		const clientIp = request.clientIp || req.ip;
		const forwardedValue = typeof forwardedFor === 'string' ? forwardedFor : '';

		headers['x-forwarded-for'] = forwardedValue
			? `${forwardedValue}, ${clientIp}`
			: clientIp || '';
		headers['x-forwarded-proto'] = req.protocol;
		headers['x-forwarded-host'] = req.headers.host ?? '';
		if (request.requestId) {
			headers['x-request-id'] = request.requestId;
		}
		if (request.user) {
			headers['x-user-id'] = request.user.id;
			headers['x-user-role'] = request.user.role;
		}
		return headers;
	}

	public manejarErrorProxy(error: NodeJS.ErrnoException, _req: Request, res: Response): void {
		console.error('Proxy error:', error);

		if (res.headersSent) {
			return;
		}

		if (error.code === 'ECONNREFUSED') {
			res.status(503).json({ message: 'Servicio no disponible' });
			return;
		}
		if (error.code === 'ETIMEDOUT') {
			res.status(504).json({ message: 'Timeout al conectar con el servicio' });
			return;
		}
		if (error.code === 'ECONNRESET') {
			res.status(502).json({ message: 'Conexion interrumpida con el servicio' });
			return;
		}
		res.status(500).json({ message: 'Error en el proxy' });
	}

	public manejarRespuestaProxy(
		proxyRes: IncomingMessage,
		req: Request,
		res: Response,
	): void {
		res.setHeader('X-Proxied-By', 'Nexus Gateway');

		const startTime = (req as { [RESPONSE_TIME_KEY]?: number })[RESPONSE_TIME_KEY];
		if (startTime) {
			const responseTimeMs = Date.now() - startTime;
			res.setHeader('X-Response-Time', `${responseTimeMs}ms`);
		}

		const target = (req as { proxyTarget?: string }).proxyTarget ?? 'unknown';
		console.log(
			`Proxy ${req.method} ${req.originalUrl} -> ${target} ${proxyRes.statusCode ?? ''}`,
		);
	}
}

const defaultProxy = new ReverseProxy(gatewayConfig);

async function proxyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
	const routeConfig = defaultProxy.encontrarRuta(req.path);
	if (!routeConfig) {
		next();
		return;
	}

	if (!defaultProxy.validarMetodo(req.method, routeConfig)) {
		res.setHeader('Allow', routeConfig.methods.join(', '));
		res.status(405).json({ message: 'Method Not Allowed' });
		return;
	}

	const request = req as AuthenticatedRequest;
	if (routeConfig.requiresAuth && !request.user) {
		res.status(401).json({ message: 'Token de autenticacion requerido' });
		return;
	}

	const targetUrl = defaultProxy.construirTargetUrl(routeConfig, req);
	(req as { proxyTarget?: string }).proxyTarget = targetUrl;

	const headers = defaultProxy.agregarHeadersProxy(req, {
		...(req.headers as Record<string, string>),
	});

	const options: httpProxy.ServerOptions = {
		target: targetUrl,
		headers,
		timeout: defaultProxy.config.timeout,
		proxyTimeout: defaultProxy.config.timeout,
		changeOrigin: true,
	};

	(req as { [RESPONSE_TIME_KEY]?: number })[RESPONSE_TIME_KEY] = Date.now();

	const maxRetries = defaultProxy.config.retries;
	for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
		try {
			await new Promise<void>((resolve, reject) => {
				defaultProxy.proxy.web(req, res, options, (error) => {
					reject(error);
				});

				res.once('finish', () => resolve());
				res.once('close', () => resolve());
			});
			return;
		} catch (error) {
			if (res.headersSent) {
				return;
			}
			if (attempt >= maxRetries) {
				defaultProxy.manejarErrorProxy(error as NodeJS.ErrnoException, req, res);
				return;
			}
			const waitMs = calculateExponentialBackoff(attempt);
			await new Promise((resolve) => setTimeout(resolve, waitMs));
		}
	}
}

function crearProxyRouter(config: GatewayConfig): Router {
	const proxyInstance = new ReverseProxy(config);
	const router = Router();

	router.use(async (req, res, next) => {
		const routeConfig = proxyInstance.encontrarRuta(req.path);
		if (!routeConfig) {
			next();
			return;
		}

		if (!proxyInstance.validarMetodo(req.method, routeConfig)) {
			res.setHeader('Allow', routeConfig.methods.join(', '));
			res.status(405).json({ message: 'Method Not Allowed' });
			return;
		}

		const request = req as AuthenticatedRequest;
		if (routeConfig.requiresAuth && !request.user) {
			res.status(401).json({ message: 'Token de autenticacion requerido' });
			return;
		}

		const targetUrl = proxyInstance.construirTargetUrl(routeConfig, req);
		(req as { proxyTarget?: string }).proxyTarget = targetUrl;

		const headers = proxyInstance.agregarHeadersProxy(req, {
			...(req.headers as Record<string, string>),
		});

		const options: httpProxy.ServerOptions = {
			target: targetUrl,
			headers,
			timeout: proxyInstance.config.timeout,
			proxyTimeout: proxyInstance.config.timeout,
			changeOrigin: true,
		};

		(req as { [RESPONSE_TIME_KEY]?: number })[RESPONSE_TIME_KEY] = Date.now();

		const maxRetries = proxyInstance.config.retries;
		for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
			try {
				await new Promise<void>((resolve, reject) => {
					proxyInstance.proxy.web(req, res, options, (error) => {
						reject(error);
					});

					res.once('finish', () => resolve());
					res.once('close', () => resolve());
				});
				return;
			} catch (error) {
				if (res.headersSent) {
					return;
				}
				if (attempt >= maxRetries) {
					proxyInstance.manejarErrorProxy(error as NodeJS.ErrnoException, req, res);
					return;
				}
				const waitMs = calculateExponentialBackoff(attempt);
				await new Promise((resolve) => setTimeout(resolve, waitMs));
			}
		}
	});

	return router;
}

export { ReverseProxy, proxyMiddleware, crearProxyRouter };
